(ns foosch.core
  (:require [clojure.data.json :as json])
  (:import [org.webbitserver WebServer WebServers WebSocketHandler WebSocketConnection]
           [org.webbitserver.handler StaticFileHandler]))

(def connections (atom #{}))
(def arena (atom #{}))


(defn packet
  [type data]
  (json/json-str {:type type :data data}))


(defn join
  "Add user to the 'arena' and notify others in the arena that a new user has joined."
  [conn conns _]
  (when-let [user (.data conn :username)]
    (swap! arena conj conn)
    (doseq [c arena]
      (when (.data c :join)
        (.send c (packet "join" user))))))


(defn login
  "Login user, i.e., attach username to connection."
  [conn _ name]
  (.data conn :username name))


(defn bad-type
  "Send an error response on unrecognized type."
  [conn _ _]
  (.send conn (packet "error" "Unrecognized type")))


(defn on-message
  [conn json]
  (let [msg     (json/read-json json)
        type    (:type msg)
        data    (:data msg)
        handler (case type
                  "join"   join
                  "login"  login
                  :else    bad-type)]
    (handler conn @connections data)))


(defn -main
  []
  (doto (WebServers/createWebServer 8080)
    (.add (StaticFileHandler. "./web"))
    (.add "/websocket"
          (reify org.webbitserver.WebSocketHandler
            (onOpen [_ conn]  (do (swap! connections conj conn)
                                  (println "opened" conn)))
            (onClose [_ conn] (do (swap! connections disj conn)
                                  (println "closed" conn)))
            (^void onMessage [_ ^WebSocketConnection conn ^String json] (on-message conn json))))
    (.start)))
