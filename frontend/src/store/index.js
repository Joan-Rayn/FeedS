import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import authReducer from './slices/authSlice';
import feedbackReducer from './slices/feedbackSlice';
import userReducer from './slices/userSlice';
import categoriesReducer from './slices/categoriesSlice';

// Configuration de la persistance
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth', 'user'], // Ne persister que l'auth et les données utilisateur
};

// Reducers avec persistance
const persistedAuthReducer = persistReducer({ ...persistConfig, key: 'auth' }, authReducer);
const persistedUserReducer = persistReducer({ ...persistConfig, key: 'user' }, userReducer);

export const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
    feedback: feedbackReducer,
    user: persistedUserReducer,
    categories: categoriesReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export const persistor = persistStore(store);
export default store;