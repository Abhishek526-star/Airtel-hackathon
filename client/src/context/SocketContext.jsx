import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState(null);
  const socketRef = useRef(null);
  const eventListenersRef = useRef(new Map());

  useEffect(() => {
    const token = localStorage.getItem('udyam_token');

    // Initialize socket connection
    const socket = io({
      path: '/socket.io',
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 15,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('[SocketClient] Connected to Real-Time Gateway. ID:', socket.id);
      setIsConnected(true);
    });

    socket.on('disconnect', (reason) => {
      console.log('[SocketClient] Disconnected from Real-Time Gateway. Reason:', reason);
      setIsConnected(false);
    });

    socket.on('connect_error', (err) => {
      console.warn('[SocketClient] Connection warning:', err.message);
      setIsConnected(false);
    });

    // Capture standard real-time events and forward to subscribed listeners
    const monitoredEvents = [
      'ORDER_CREATED',
      'ORDER_STATUS_UPDATED',
      'KYC_STATUS_UPDATED',
      'KYC_EXCEPTION_ASSIGNED',
      'TECHNICIAN_TASK_UPDATED',
      'SERVICE_ACTIVATED',
      'PARTNER_ASSISTANCE_REQUESTED',
    ];

    monitoredEvents.forEach((eventName) => {
      socket.on(eventName, (data) => {
        setLastEvent({ type: eventName, data, timestamp: new Date() });
        const handlers = eventListenersRef.current.get(eventName) || [];
        handlers.forEach((handler) => {
          try {
            handler(data);
          } catch (handlerErr) {
            console.error(`[SocketClient Error] Event ${eventName} handler failed:`, handlerErr);
          }
        });
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [isAuthenticated, user?._id]);

  const joinOrder = useCallback((orderId) => {
    if (socketRef.current && orderId) {
      socketRef.current.emit('join_order', orderId);
    }
  }, []);

  const leaveOrder = useCallback((orderId) => {
    if (socketRef.current && orderId) {
      socketRef.current.emit('leave_order', orderId);
    }
  }, []);

  const subscribe = useCallback((eventName, handler) => {
    if (!eventListenersRef.current.has(eventName)) {
      eventListenersRef.current.set(eventName, new Set());
    }
    eventListenersRef.current.get(eventName).add(handler);

    // Return cleanup function
    return () => {
      const set = eventListenersRef.current.get(eventName);
      if (set) {
        set.delete(handler);
        if (set.size === 0) {
          eventListenersRef.current.delete(eventName);
        }
      }
    };
  }, []);

  return (
    <SocketContext.Provider
      value={{
        socket: socketRef.current,
        isConnected,
        lastEvent,
        joinOrder,
        leaveOrder,
        subscribe,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

// Convenience hook to register an event handler with auto-cleanup
export const useRealtimeEvent = (eventName, handler) => {
  const { subscribe } = useSocket();
  const handlerRef = useRef(handler);

  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    if (!eventName) return;
    const cleanup = subscribe(eventName, (data) => {
      if (handlerRef.current) {
        handlerRef.current(data);
      }
    });
    return cleanup;
  }, [eventName, subscribe]);
};

