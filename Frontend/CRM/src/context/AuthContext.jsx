import { createContext, useState, useEffect, useRef } from "react";

import { getProfile } from "../api/authApi";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Active SSE connection
  const sseAbortControllerRef = useRef(null);

  // Controls whether reconnection should happen
  const shouldReconnectRef = useRef(true);

  // Stores reconnect timer
  const reconnectTimeoutRef = useRef(null);

  const reconnectToNotificationStream = () => {
    // Don't reconnect after logout/unmount
    if (!shouldReconnectRef.current) {
      return;
    }

    // Prevent multiple reconnect timers
    if (reconnectTimeoutRef.current) {
      return;
    }

    console.log("Reconnecting to SSE in 3 seconds...");

    reconnectTimeoutRef.current = setTimeout(() => {
      reconnectTimeoutRef.current = null;

      if (shouldReconnectRef.current) {
        connectToNotificationStream();
      }
    }, 3000);
  };

  const connectToNotificationStream = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      return;
    }

    // Close previous connection if one exists
    if (sseAbortControllerRef.current) {
      sseAbortControllerRef.current.abort();
    }

    const controller = new AbortController();
    sseAbortControllerRef.current = controller;

    try {
      const response = await fetch(
        "http://localhost:8080/api/notifications/stream",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "text/event-stream",
          },
          signal: controller.signal,
        },
      );

      if (!response.ok) {
        throw new Error(`SSE connection failed: ${response.status}`);
      }

      if (!response.body) {
        throw new Error("ReadableStream is not supported by this browser");
      }

      console.log("SSE connection established");

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");

      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();

        if (done) {
          console.log("SSE connection closed");

          reconnectToNotificationStream();

          break;
        }

        buffer += decoder.decode(value, {
          stream: true,
        });

        const events = buffer.split("\n\n");

        buffer = events.pop();

        for (const event of events) {
          if (!event.trim()) {
            continue;
          }

          console.log("SSE event received:", event);

          if (event.includes("event:notification")) {
            const dataLine = event
              .split("\n")
              .find((line) => line.startsWith("data:"));

            if (dataLine) {
              const jsonData = dataLine.replace("data:", "").trim();

              try {
                const notification = JSON.parse(jsonData);

                console.log("New notification received:", notification);

                window.dispatchEvent(
                  new CustomEvent("new-notification", {
                    detail: notification,
                  }),
                );
              } catch (error) {
                console.error("Failed to parse SSE notification:", error);
              }
            }
          }
        }
      }
    } catch (error) {
      if (error.name === "AbortError") {
        console.log("SSE connection aborted");
        return;
      }

      console.error("SSE connection error:", error);

      reconnectToNotificationStream();
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      getProfile()
        .then((response) => {
          setUser(response.data);
        })
        .catch(() => {
          localStorage.removeItem("token");
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user) {
      return;
    }

    shouldReconnectRef.current = true;

    connectToNotificationStream();

    return () => {
      shouldReconnectRef.current = false;

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }

      if (sseAbortControllerRef.current) {
        sseAbortControllerRef.current.abort();
        sseAbortControllerRef.current = null;
      }
    };
  }, [user]);

  const login = (userData) => {
    shouldReconnectRef.current = true;
    setUser(userData);
  };

  const logout = () => {
    shouldReconnectRef.current = false;

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (sseAbortControllerRef.current) {
      sseAbortControllerRef.current.abort();
      sseAbortControllerRef.current = null;
    }

    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
