import React, { createContext, useContext, useState } from 'react';

const OnboardingContext = createContext(null);

export const OnboardingProvider = ({ children }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedBundle, setSelectedBundle] = useState(null);
  const [cartItems, setCartItems] = useState([
    { productId: 'P01', quantity: 1 },
    { productId: 'P07', quantity: 2 },
    { productId: 'P19', quantity: 1 },
  ]);
  const [contractDuration, setContractDuration] = useState(12);
  const [activeQuote, setActiveQuote] = useState(null);
  const [kycData, setKycData] = useState({
    consentGiven: false,
    documentId: null,
    verificationStatus: 'NOT_STARTED',
    extractedId: '',
    notes: '',
  });
  const [activeOrder, setActiveOrder] = useState(null);

  const setBundleFromAdvisor = (bundle) => {
    setSelectedBundle(bundle);
    if (bundle && bundle.recommendedProducts) {
      const items = bundle.recommendedProducts.map((p) => ({
        productId: p.productId,
        quantity: 1,
      }));
      setCartItems(items);
    }
  };

  const addItemToCart = (productId) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.productId === productId);
      if (existing) {
        return prev.map((i) => (i.productId === productId ? { ...i, quantity: i.quantity + 1 } : i));
      }
      return [...prev, { productId, quantity: 1 }];
    });
  };

  const removeItemFromCart = (productId) => {
    setCartItems((prev) => prev.filter((i) => i.productId !== productId));
  };

  const updateItemQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeItemFromCart(productId);
    } else {
      setCartItems((prev) =>
        prev.map((i) => (i.productId === productId ? { ...i, quantity } : i))
      );
    }
  };

  return (
    <OnboardingContext.Provider
      value={{
        currentStep,
        setCurrentStep,
        selectedBundle,
        setBundleFromAdvisor,
        cartItems,
        setCartItems,
        addItemToCart,
        removeItemFromCart,
        updateItemQuantity,
        contractDuration,
        setContractDuration,
        activeQuote,
        setActiveQuote,
        kycData,
        setKycData,
        activeOrder,
        setActiveOrder,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};
