# AGASEKE Technical Challenges & Solutions

## Overview

This document outlines the major technical challenges encountered during the development of the AGASEKE digital piggy bank application, along with the solutions implemented and lessons learned. These insights provide valuable guidance for future development and maintenance.

## Challenge Categories

### 1. Authentication & Security Challenges

#### Challenge 1.1: JWT Token Management & Security
**Problem**: Implementing secure, stateless authentication across mobile and backend systems while maintaining user session persistence.

**Technical Details**:
- JWT token storage in mobile environment
- Token expiration handling
- Secure token transmission
- Cross-platform consistency

**Solutions Implemented**:

```javascript
// Frontend: Secure token storage with automatic refresh
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // Automatic token restoration on app launch
  useEffect(() => {
    const bootstrap = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('authToken');
        if (storedToken) {
          setAuthToken(storedToken);
          setToken(storedToken);
          await fetchProfile(storedToken);
        }
      } catch (error) {
        console.error('Failed to restore session', error);
        // Graceful degradation: clear corrupted token
        await AsyncStorage.removeItem('authToken');
      } finally {
        setIsInitializing(false);
      }
    };
    bootstrap();
  }, []);
};

// Backend: JWT middleware with proper error handling
const auth = (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired. Please login again.' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token.' });
    }
    res.status(500).json({ error: 'Token verification failed.' });
  }
};
```

**Key Learning Points**:
- Always validate token format before verification
- Implement graceful token expiration handling
- Use secure storage mechanisms on mobile devices
- Provide clear error messages for authentication failures

---

#### Challenge 1.2: Password Security & Hashing
**Problem**: Ensuring robust password security while maintaining performance and user experience.

**Technical Details**:
- Choosing appropriate hashing algorithm
- Salt round optimization
- Preventing timing attacks
- Password validation complexity

**Solutions Implemented**:

```javascript
// User model with pre-save middleware
const userSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  // ... other fields
});

// Automatic password hashing with optimal salt rounds
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    // 10 salt rounds provide good security/performance balance
    this.password = await bcrypt.hash(this.password, 10);
    next();
  } catch (error) {
    next(error);
  }
});

// Secure password comparison method
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Login controller with timing attack prevention
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Always perform database lookup to prevent email enumeration
    const user = await User.findOne({ email }).select('+password');
    
    // Use constant-time comparison even for non-existent users
    const isValidUser = user !== null;
    const isValidPassword = isValidUser 
      ? await user.comparePassword(password)
      : await bcrypt.compare(password, '$2b$10$invalidhash'); // Dummy hash
    
    if (!isValidUser || !isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });
    
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: 'Authentication failed' });
  }
};
```

**Key Learning Points**:
- Use bcrypt with appropriate salt rounds (10-12 for current hardware)
- Implement timing attack prevention in authentication
- Never expose whether email exists during login attempts
- Use Mongoose pre-save middleware for consistent password hashing

---

### 2. Data Synchronization & State Management

#### Challenge 2.1: Cross-Component State Management
**Problem**: Maintaining consistent application state across multiple React Native screens and components, especially for authentication and theme management.

**Technical Details**:
- Context API vs Redux decision
- State persistence across app restarts
- Performance implications of context updates
- Avoiding prop drilling

**Solutions Implemented**:

```javascript
// Optimized Context structure to prevent unnecessary re-renders
const AuthContext = createContext({
  token: null,
  user: null,
  isInitializing: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
});

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // Memoize context value to prevent unnecessary re-renders
  const value = useMemo(
    () => ({
      token,
      user,
      isInitializing,
      login,
      register,
      logout,
      refreshProfile: fetchProfile,
    }),
    [token, user, isInitializing] // Only re-render when these change
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Theme context with persistent storage
const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Load theme preference on app start
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('isDarkMode');
        if (savedTheme !== null) {
          setIsDarkMode(JSON.parse(savedTheme));
        }
      } catch (error) {
        console.warn('Failed to load theme preference');
      }
    };
    loadTheme();
  }, []);

  // Persist theme changes
  const toggleTheme = useCallback(async () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    try {
      await AsyncStorage.setItem('isDarkMode', JSON.stringify(newTheme));
    } catch (error) {
      console.warn('Failed to save theme preference');
    }
  }, [isDarkMode]);

  const colors = useMemo(
    () => (isDarkMode ? darkColors : lightColors),
    [isDarkMode]
  );

  const value = useMemo(
    () => ({ isDarkMode, toggleTheme, colors }),
    [isDarkMode, toggleTheme, colors]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
```

**Key Learning Points**:
- Use useMemo and useCallback to optimize Context performance
- Separate concerns into different contexts (auth, theme, etc.)
- Implement graceful fallbacks for storage failures
- Consider the re-render implications of context structure

---

#### Challenge 2.2: API Data Consistency & Error Handling
**Problem**: Ensuring consistent data flow between mobile app and backend API, with robust error handling and user feedback.

**Technical Details**:
- Network connectivity issues
- API response standardization
- Error message consistency
- Offline functionality considerations

**Solutions Implemented**:

```javascript
// Centralized API service with interceptors
import axios from 'axios';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for automatic token attachment
api.interceptors.request.use(
  (config) => {
    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for consistent error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      // Timeout error
      error.message = 'Request timed out. Please check your connection.';
    } else if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect
      AsyncStorage.removeItem('authToken');
      // Trigger logout in auth context
    } else if (!error.response) {
      // Network error
      error.message = 'Unable to reach server. Please check your internet connection.';
    }
    return Promise.reject(error);
  }
);

// Standardized error handling utility
export const handleApiError = (error) => {
  if (error.response?.data?.error) {
    return error.response.data.error;
  }
  if (error.message === "Network Error") {
    return "Unable to reach the server. Check your connection.";
  }
  return error.message || "Something went wrong. Please try again.";
};

// Backend standardized response format
const sendResponse = (res, statusCode, data, message, error = null) => {
  const response = {
    success: statusCode < 400,
    timestamp: new Date().toISOString(),
  };

  if (error) {
    response.error = error;
  } else {
    response.data = data;
    if (message) response.message = message;
  }

  return res.status(statusCode).json(response);
};

// Example usage in controllers
exports.getUserSavings = async (req, res) => {
  try {
    const savings = await Saving.find({ userId: req.user.id });
    return sendResponse(res, 200, savings, 'Savings retrieved successfully');
  } catch (error) {
    console.error('Error fetching savings:', error);
    return sendResponse(res, 500, null, null, 'Failed to retrieve savings');
  }
};
```

**Key Learning Points**:
- Implement request/response interceptors for consistent behavior
- Create standardized error handling utilities
- Use meaningful timeout values for different operations
- Provide clear, user-friendly error messages

---

### 3. Mobile Development Challenges

#### Challenge 3.1: React Navigation & Deep Linking
**Problem**: Implementing complex navigation patterns with nested navigators while maintaining proper state management and deep linking support.

**Technical Details**:
- Stack and Tab navigator integration
- Navigation state persistence
- Deep linking configuration
- Authentication-based navigation

**Solutions Implemented**:

```javascript
// Navigation structure with conditional rendering
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const AuthStack = createNativeStackNavigator();

// Main tabs for authenticated users
const MainTabs = () => {
  const { colors } = useThemeMode();
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: { 
          height: 72, 
          paddingBottom: 12, 
          paddingTop: 8,
          backgroundColor: colors.surface 
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.subtitle,
        tabBarIcon: ({ color, focused }) => getTabIcon(route.name, color, focused),
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Activity" component={ActivityScreen} />
      <Tab.Screen name="Terms" component={TermsScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
};

// Authentication flow for non-authenticated users
const AuthFlow = () => {
  const [isFirstLaunch, setIsFirstLaunch] = useState(null);
  
  useEffect(() => {
    const checkFirstLaunch = async () => {
      try {
        const hasLaunched = await AsyncStorage.getItem("hasLaunched");
        setIsFirstLaunch(hasLaunched === null);
        if (hasLaunched === null) {
          await AsyncStorage.setItem("hasLaunched", "true");
        }
      } catch (error) {
        setIsFirstLaunch(true);
      }
    };
    checkFirstLaunch();
  }, []);

  if (isFirstLaunch === null) {
    return <LoadingScreen />; // Show loading while checking
  }

  return (
    <AuthStack.Navigator 
      screenOptions={{ headerShown: false }}
      initialRouteName={isFirstLaunch ? "GetStarted" : "Login"}
    >
      <AuthStack.Screen name="GetStarted" component={GetStartedScreen} />
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Signup" component={SignupScreen} />
    </AuthStack.Navigator>
  );
};

// Root navigator with authentication handling
const RootNavigator = () => {
  const { token, isInitializing } = useAuth();
  const { colors } = useThemeMode();

  // Show loading screen while checking authentication
  if (isInitializing) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  // Conditional navigation based on authentication
  return token ? <AppFlow /> : <AuthFlow />;
};

// App flow for authenticated users with modal screens
const AppFlow = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="Main"
      component={MainTabs}
      options={{ headerShown: false }}
    />
    {/* Modal-style screens */}
    <Stack.Screen
      name="Deposit"
      component={DepositScreen}
      options={{ 
        title: "Deposit Money",
        presentation: 'modal' // iOS-style modal presentation
      }}
    />
    <Stack.Screen
      name="Withdraw"
      component={WithdrawScreen}
      options={{ 
        title: "Request Withdrawal",
        presentation: 'modal'
      }}
    />
  </Stack.Navigator>
);

// Deep linking configuration
const linking = {
  prefixes: ['agaseke://'],
  config: {
    screens: {
      Main: {
        screens: {
          Home: 'home',
          Settings: 'settings',
        },
      },
      Deposit: 'deposit',
      Withdraw: 'withdraw',
      Login: 'login',
      Signup: 'signup',
    },
  },
};

// Main App component
export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NavigationContainer 
          linking={linking}
          fallback={<LoadingScreen />}
        >
          <RootNavigator />
        </NavigationContainer>
      </AuthProvider>
    </ThemeProvider>
  );
}
```

**Key Learning Points**:
- Use conditional navigation based on authentication state
- Implement proper loading states during navigation setup
- Configure deep linking early in development
- Use modal presentation for temporary screens

---

#### Challenge 3.2: Cross-Platform Compatibility & Performance
**Problem**: Ensuring consistent behavior and performance across iOS and Android platforms while leveraging platform-specific features.

**Technical Details**:
- Platform-specific styling differences
- Performance optimization for different devices
- Keyboard handling variations
- Safe area handling

**Solutions Implemented**:

```javascript
// Platform-specific styling
import { Platform, StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    ...Platform.select({
      ios: {
        paddingTop: 20, // iOS status bar
      },
      android: {
        paddingTop: 10, // Different Android behavior
      },
    }),
  },
  shadowBox: {
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
});

// Safe area handling component
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

const Screen = ({ children, style, ...props }) => {
  const { colors } = useThemeMode();
  
  return (
    <SafeAreaView 
      style={[
        { 
          flex: 1, 
          backgroundColor: colors.background 
        }, 
        style
      ]} 
      {...props}
    >
      {children}
    </SafeAreaView>
  );
};

// Keyboard-aware scrolling
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

const LoginScreen = () => {
  return (
    <Screen>
      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid={true}
        extraHeight={Platform.OS === 'ios' ? 100 : 150}
      >
        {/* Form content */}
      </KeyboardAwareScrollView>
    </Screen>
  );
};

// Performance optimization with memoization
import React, { memo, useMemo } from 'react';

const BalanceCard = memo(({ balance, goalAmount, goalName }) => {
  const { colors } = useThemeMode();
  
  // Memoize expensive calculations
  const progressPercentage = useMemo(() => {
    if (!goalAmount || goalAmount === 0) return 0;
    return Math.min((balance / goalAmount) * 100, 100);
  }, [balance, goalAmount]);

  const formattedBalance = useMemo(() => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(balance);
  }, [balance]);

  return (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      <Text style={[styles.goalName, { color: colors.text }]}>
        {goalName}
      </Text>
      <Text style={[styles.balance, { color: colors.primary }]}>
        {formattedBalance}
      </Text>
      <ProgressBar progress={progressPercentage} />
    </View>
  );
});

// Image optimization
import { Image } from 'expo-image';

const OptimizedImage = ({ source, style, ...props }) => {
  return (
    <Image
      source={source}
      style={style}
      contentFit="cover"
      transition={200}
      placeholder={{ blurhash: 'L6Pj0^jE.AyE_3t7t7R**0o#DgR4' }}
      {...props}
    />
  );
};
```

**Key Learning Points**:
- Use Platform.select() for platform-specific code
- Implement proper safe area handling for different devices
- Optimize performance with React.memo and useMemo
- Use KeyboardAwareScrollView for form screens

---

### 4. Database & Backend Challenges

#### Challenge 4.1: MongoDB Schema Design & Relationships
**Problem**: Designing flexible MongoDB schemas that support the application's savings and withdrawal workflow while maintaining data integrity.

**Technical Details**:
- Choosing between embedding vs referencing
- Handling user-savings-withdrawals relationships
- Implementing business logic validation
- Optimizing query performance

**Solutions Implemented**:

```javascript
// User Schema with validation and indexing
const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Name is required'],
    trim: true,
    maxLength: [100, 'Name cannot exceed 100 characters']
  },
  email: { 
    type: String, 
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    validate: {
      validator: function(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      },
      message: 'Please enter a valid email address'
    }
  },
  password: { 
    type: String, 
    required: [true, 'Password is required'],
    minLength: [6, 'Password must be at least 6 characters']
  },
  coSignerEmail: { 
    type: String, 
    required: [true, 'Co-signer email is required'],
    validate: {
      validator: function(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      },
      message: 'Please enter a valid co-signer email'
    }
  }
}, { 
  timestamps: true 
});

// Compound index for better query performance
userSchema.index({ email: 1, createdAt: -1 });

// Savings Schema with business logic validation
const savingSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true // Index for faster user queries
  },
  goalName: { 
    type: String, 
    required: [true, 'Goal name is required'],
    trim: true,
    maxLength: [100, 'Goal name cannot exceed 100 characters']
  },
  targetAmount: { 
    type: Number, 
    required: [true, 'Target amount is required'],
    min: [1, 'Target amount must be positive']
  },
  currentAmount: { 
    type: Number, 
    default: 0,
    min: [0, 'Current amount cannot be negative']
  },
  lockUntil: { 
    type: Date, 
    required: [true, 'Lock date is required'],
    validate: {
      validator: function(date) {
        return date > new Date();
      },
      message: 'Lock date must be in the future'
    }
  }
}, { 
  timestamps: true 
});

// Prevent multiple savings goals per user
savingSchema.index({ userId: 1 }, { unique: true });

// Virtual for progress percentage
savingSchema.virtual('progressPercentage').get(function() {
  return this.targetAmount > 0 ? (this.currentAmount / this.targetAmount) * 100 : 0;
});

// Pre-save middleware for business logic
savingSchema.pre('save', function(next) {
  // Ensure current amount doesn't exceed target
  if (this.currentAmount > this.targetAmount) {
    this.currentAmount = this.targetAmount;
  }
  next();
});

// Withdrawal Schema with status tracking
const withdrawalSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  amount: { 
    type: Number, 
    required: [true, 'Amount is required'],
    min: [0.01, 'Amount must be positive']
  },
  status: { 
    type: String, 
    enum: {
      values: ['pending', 'approved', 'rejected'],
      message: 'Status must be pending, approved, or rejected'
    },
    default: 'pending'
  },
  reason: {
    type: String,
    maxLength: [500, 'Reason cannot exceed 500 characters']
  },
  processedAt: {
    type: Date
  },
  processedBy: {
    type: String // Co-signer email
  }
}, { 
  timestamps: true 
});

// Compound index for efficient querying
withdrawalSchema.index({ userId: 1, status: 1, createdAt: -1 });
withdrawalSchema.index({ status: 1, createdAt: -1 });

// Pre-save middleware for processing timestamp
withdrawalSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status !== 'pending') {
    this.processedAt = new Date();
  }
  next();
});
```

**Key Learning Points**:
- Use proper indexing for frequently queried fields
- Implement validation at the schema level for data integrity
- Use virtual properties for computed values
- Leverage pre/post middleware for business logic

---

#### Challenge 4.2: Complex Business Logic Implementation
**Problem**: Implementing withdrawal approval workflow with co-signer authentication and time-lock validation.

**Technical Details**:
- Multi-step approval process
- Time-based restrictions
- Co-signer authorization verification
- Transaction atomicity

**Solutions Implemented**:

```javascript
// Withdrawal request with comprehensive validation
exports.requestWithdrawal = async (req, res) => {
  const session = await mongoose.startSession();
  
  try {
    await session.withTransaction(async () => {
      const { amount, reason } = req.body;
      const userId = req.user.id;

      // Validate input
      if (!amount || amount <= 0) {
        throw new Error('Invalid withdrawal amount');
      }

      // Get user's savings with lock
      const saving = await Saving.findOne({ userId }).session(session);
      if (!saving) {
        throw new Error('No savings goal found');
      }

      // Check time lock
      if (new Date() < new Date(saving.lockUntil)) {
        const lockDate = saving.lockUntil.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
        throw new Error(`Withdrawal locked until ${lockDate}`);
      }

      // Check sufficient funds
      if (amount > saving.currentAmount) {
        throw new Error(
          `Insufficient funds. Available: ${saving.currentAmount}`
        );
      }

      // Check for existing pending withdrawal
      const pendingWithdrawal = await Withdrawal.findOne({
        userId,
        status: 'pending'
      }).session(session);

      if (pendingWithdrawal) {
        throw new Error('You already have a pending withdrawal request');
      }

      // Create withdrawal request
      const withdrawal = new Withdrawal({
        userId,
        amount,
        reason,
        status: 'pending'
      });

      await withdrawal.save({ session });

      // Log the transaction
      console.log(`Withdrawal request created: ${withdrawal._id} for user: ${userId}`);
      
      res.status(201).json({
        success: true,
        message: 'Withdrawal request sent to co-signer',
        withdrawalId: withdrawal._id
      });
    });
  } catch (error) {
    console.error('Withdrawal request error:', error);
    res.status(400).json({ 
      success: false, 
      error: error.message 
    });
  } finally {
    await session.endSession();
  }
};

// Co-signer approval with authorization checks
exports.approveWithdrawal = async (req, res) => {
  const session = await mongoose.startSession();
  
  try {
    await session.withTransaction(async () => {
      const { id: withdrawalId } = req.params;
      const { status } = req.body;
      const coSignerEmail = req.user.email;

      // Validate status
      if (!['approved', 'rejected'].includes(status)) {
        throw new Error('Invalid status. Must be approved or rejected');
      }

      // Get withdrawal request
      const withdrawal = await Withdrawal.findById(withdrawalId)
        .populate('userId', 'coSignerEmail')
        .session(session);

      if (!withdrawal) {
        throw new Error('Withdrawal request not found');
      }

      // Verify co-signer authorization
      if (withdrawal.userId.coSignerEmail !== coSignerEmail) {
        throw new Error('Not authorized to process this withdrawal');
      }

      // Check if already processed
      if (withdrawal.status !== 'pending') {
        throw new Error('Withdrawal request already processed');
      }

      // Update withdrawal status
      withdrawal.status = status;
      withdrawal.processedAt = new Date();
      withdrawal.processedBy = coSignerEmail;

      await withdrawal.save({ session });

      // Process approved withdrawal
      if (status === 'approved') {
        const saving = await Saving.findOne({ 
          userId: withdrawal.userId._id 
        }).session(session);

        if (!saving) {
          throw new Error('Savings goal not found');
        }

        // Double-check funds availability
        if (saving.currentAmount < withdrawal.amount) {
          throw new Error('Insufficient funds in savings');
        }

        // Deduct amount from savings
        saving.currentAmount -= withdrawal.amount;
        await saving.save({ session });

        console.log(`Withdrawal approved and processed: ${withdrawalId}`);
        
        res.json({
          success: true,
          message: 'Withdrawal approved and processed',
          newBalance: saving.currentAmount
        });
      } else {
        console.log(`Withdrawal rejected: ${withdrawalId}`);
        
        res.json({
          success: true,
          message: 'Withdrawal request rejected'
        });
      }
    });
  } catch (error) {
    console.error('Withdrawal approval error:', error);
    res.status(400).json({ 
      success: false, 
      error: error.message 
    });
  } finally {
    await session.endSession();
  }
};

// Get pending withdrawals for co-signer
exports.getPendingForCoSigner = async (req, res) => {
  try {
    const coSignerEmail = req.user.email;

    // Find all users who have this co-signer
    const users = await User.find({ 
      coSignerEmail: coSignerEmail 
    }, '_id name email');

    if (users.length === 0) {
      return res.json({
        success: true,
        data: [],
        message: 'No users assigned to this co-signer'
      });
    }

    const userIds = users.map(user => user._id);

    // Find pending withdrawals for those users
    const withdrawals = await Withdrawal.find({
      userId: { $in: userIds },
      status: 'pending'
    })
    .populate('userId', 'name email')
    .sort({ createdAt: -1 });

    // Add user context to each withdrawal
    const withdrawalsWithContext = withdrawals.map(withdrawal => ({
      ...withdrawal.toObject(),
      userInfo: {
        name: withdrawal.userId.name,
        email: withdrawal.userId.email
      }
    }));

    res.json({
      success: true,
      data: withdrawalsWithContext,
      count: withdrawalsWithContext.length
    });
  } catch (error) {
    console.error('Error fetching pending withdrawals:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch pending withdrawals' 
    });
  }
};
```

**Key Learning Points**:
- Use MongoDB transactions for complex multi-document operations
- Implement proper authorization checks at multiple levels
- Add comprehensive logging for audit trails
- Handle edge cases and provide clear error messages

---

### 5. Performance & Optimization Challenges

#### Challenge 5.1: Mobile App Performance Optimization
**Problem**: Ensuring smooth performance across different mobile devices with varying capabilities and network conditions.

**Technical Details**:
- Bundle size optimization
- Image loading optimization
- List rendering performance
- Memory management

**Solutions Implemented**:

```javascript
// Optimized FlatList for large datasets
import React, { memo, useMemo, useCallback } from 'react';
import { FlatList, View, Text } from 'react-native';

const TransactionItem = memo(({ transaction, onPress }) => {
  const { colors } = useThemeMode();
  
  const formattedAmount = useMemo(() => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(transaction.amount);
  }, [transaction.amount]);

  const formattedDate = useMemo(() => {
    return new Date(transaction.createdAt).toLocaleDateString();
  }, [transaction.createdAt]);

  const handlePress = useCallback(() => {
    onPress(transaction);
  }, [transaction, onPress]);

  return (
    <Pressable 
      onPress={handlePress}
      style={[styles.item, { backgroundColor: colors.surface }]}
    >
      <Text style={[styles.amount, { color: colors.text }]}>
        {formattedAmount}
      </Text>
      <Text style={[styles.date, { color: colors.subtitle }]}>
        {formattedDate}
      </Text>
    </Pressable>
  );
});

const TransactionList = ({ transactions }) => {
  const keyExtractor = useCallback((item) => item._id, []);
  
  const renderItem = useCallback(({ item }) => (
    <TransactionItem 
      transaction={item} 
      onPress={handleTransactionPress}
    />
  ), []);

  const getItemLayout = useCallback((data, index) => ({
    length: 80, // Fixed item height
    offset: 80 * index,
    index,
  }), []);

  return (
    <FlatList
      data={transactions}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      getItemLayout={getItemLayout}
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      windowSize={10}
      initialNumToRender={15}
      maintainVisibleContentPosition={{
        minIndexForVisible: 0,
        autoscrollToTopThreshold: 100,
      }}
    />
  );
};

// Image caching and optimization
import { Image } from 'expo-image';

const CachedImage = memo(({ source, style, placeholder, ...props }) => {
  return (
    <Image
      source={source}
      style={style}
      placeholder={placeholder}
      contentFit="cover"
      transition={200}
      cachePolicy="disk"
      recyclingKey={source.uri} // Help with memory management
      {...props}
    />
  );
});

// Bundle optimization with dynamic imports
const LazyGoalsScreen = lazy(() => import('./screens/GoalsScreen'));
const LazyActivityScreen = lazy(() => import('./screens/ActivityScreen'));

const App = () => {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <NavigationContainer>
        {/* Navigation configuration */}
      </NavigationContainer>
    </Suspense>
  );
};

// Memory leak prevention
const useCleanup = (callback) => {
  useEffect(() => {
    return callback; // Return cleanup function
  }, [callback]);
};

const SomeComponent = () => {
  const [data, setData] = useState(null);
  
  useCleanup(() => {
    // Cleanup function to prevent memory leaks
    setData(null);
  });

  useEffect(() => {
    let cancelled = false;
    
    const fetchData = async () => {
      try {
        const response = await api.get('/some-endpoint');
        if (!cancelled) {
          setData(response.data);
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Fetch error:', error);
        }
      }
    };

    fetchData();

    return () => {
      cancelled = true; // Prevent state updates after unmount
    };
  }, []);

  return (
    <View>
      {/* Component content */}
    </View>
  );
};
```

**Key Learning Points**:
- Use FlatList optimization props for large datasets
- Implement proper image caching and optimization
- Use dynamic imports for code splitting
- Prevent memory leaks with proper cleanup

---

#### Challenge 5.2: API Performance & Scalability
**Problem**: Optimizing backend API performance and preparing for increased load as user base grows.

**Technical Details**:
- Database query optimization
- Caching strategies
- Request rate limiting
- Connection pooling

**Solutions Implemented**:

```javascript
// Database connection optimization
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // Connection pool settings
      maxPoolSize: 10, // Maximum number of connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      bufferMaxEntries: 0, // Disable mongoose buffering
      bufferCommands: false, // Disable mongoose buffering
      
      // Additional optimization
      maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
      
      // Write concern
      writeConcern: {
        w: 'majority',
        j: true, // Request acknowledgment that write operations have been persisted to the journal
      }
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Monitor connection events
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });

  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
};

// Query optimization with proper indexing
// Optimized savings queries
exports.getUserSavings = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Use lean() for faster queries when we don't need full Mongoose documents
    const savings = await Saving.findOne({ userId })
      .lean() // Returns plain JavaScript objects
      .select('goalName targetAmount currentAmount lockUntil createdAt') // Only select needed fields
      .exec();

    if (!savings) {
      return res.json({
        success: true,
        data: null,
        message: 'No savings goal found'
      });
    }

    // Add computed fields
    savings.progressPercentage = savings.targetAmount > 0 
      ? (savings.currentAmount / savings.targetAmount) * 100 
      : 0;

    res.json({
      success: true,
      data: savings
    });
  } catch (error) {
    console.error('Error fetching savings:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to retrieve savings' 
    });
  }
};

// Caching middleware with Redis
const redis = require('redis');
const client = redis.createClient(process.env.REDIS_URL);

const cacheMiddleware = (duration = 300) => { // 5 minutes default
  return async (req, res, next) => {
    if (req.method !== 'GET') {
      return next();
    }

    const key = `cache:${req.originalUrl || req.url}:${req.user?.id || 'anonymous'}`;
    
    try {
      const cached = await client.get(key);
      if (cached) {
        console.log('Cache hit:', key);
        return res.json(JSON.parse(cached));
      }
    } catch (error) {
      console.warn('Cache read error:', error);
    }

    // Override res.json to cache the response
    const originalJson = res.json.bind(res);
    res.json = (data) => {
      // Cache successful responses only
      if (res.statusCode === 200 && data.success) {
        client.setex(key, duration, JSON.stringify(data))
          .catch(err => console.warn('Cache write error:', err));
      }
      return originalJson(data);
    };

    next();
  };
};

// Rate limiting middleware
const rateLimit = require('express-rate-limit');

const createRateLimiter = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      error: message
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    keyGenerator: (req) => {
      // Use user ID if authenticated, otherwise IP address
      return req.user?.id || req.ip;
    }
  });
};

// Different rate limits for different endpoints
const authLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  5, // 5 attempts
  'Too many authentication attempts, please try again later'
);

const apiLimiter = createRateLimiter(
  60 * 1000, // 1 minute
  100, // 100 requests
  'Too many requests, please try again later'
);

// Apply rate limiting
app.use('/api/auth', authLimiter);
app.use('/api', apiLimiter);

// Request logging middleware for monitoring
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`);
    
    // Log slow requests
    if (duration > 1000) {
      console.warn(`Slow request detected: ${req.method} ${req.originalUrl} took ${duration}ms`);
    }
  });
  
  next();
};

app.use(requestLogger);

// Optimized aggregation pipeline for complex queries
exports.getUserStats = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    
    const stats = await Withdrawal.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      },
      {
        $project: {
          status: '$_id',
          count: 1,
          totalAmount: 1,
          _id: 0
        }
      }
    ]);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to retrieve statistics' 
    });
  }
};
```

**Key Learning Points**:
- Use connection pooling and proper MongoDB settings
- Implement caching for frequently accessed data
- Use rate limiting to prevent abuse
- Monitor and log slow queries for optimization

---

## Lessons Learned & Best Practices

### 1. Security Best Practices
- Always validate input on both frontend and backend
- Use environment variables for sensitive configuration
- Implement proper error handling without exposing sensitive information
- Use HTTPS in production and implement proper CORS policies
- Regularly update dependencies to patch security vulnerabilities

### 2. Performance Optimization
- Optimize database queries with proper indexing and lean queries
- Use caching strategically for frequently accessed data
- Implement proper pagination for large datasets
- Optimize mobile app bundle size and use code splitting
- Monitor performance metrics and set up alerts for issues

### 3. Development Workflow
- Use consistent error handling patterns across the application
- Implement comprehensive logging for debugging and monitoring
- Use TypeScript or PropTypes for better type safety
- Set up proper testing environments and automated testing
- Document API endpoints and maintain up-to-date documentation

### 4. Scalability Considerations
- Design database schemas with growth in mind
- Use microservices architecture for large applications
- Implement proper load balancing and auto-scaling
- Plan for database sharding and replication
- Use CDNs for static asset delivery

### 5. User Experience
- Implement proper loading states and error feedback
- Use optimistic updates where appropriate
- Provide clear error messages and recovery options
- Test on various devices and network conditions
- Implement proper accessibility features

