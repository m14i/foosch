(ns foosch.core
  (:require [clojure.data.json :as json])
  (:import [org.webbitserver WebServer WebServers WebSocketHandler WebSocketConnection]
           [org.webbitserver.handler StaticFileHandler]))


(def connections (atom #{}))
(def arena (atom #{}))


(defn packet
  [type data]
  (json/json-str {:type type :data data}))


(defn arena-full?
  [arena]
  (< 3 (count arena)))


(defn join
  "Add user to the 'arena' and notify others in the arena that a new user has joined."
  [conn conns _]
  (println "join")
  (println "arena" @arena)
  (when-let [user (.data conn "user")]  ;; user must be logged in to join
    (swap! arena conj conn)
    (if (arena-full? @arena)
      (let [players (take 4 @arena)
            names   (map #(.data % "user") players)]
        (swap! arena disj players)
        (doseq [c players]
          (.send c (packet "play" names))))
      (doseq [c @arena]
        (.send c (packet "join" user))))))


(defn leave
  "Remove user from 'arena' and notify others that a user has left."
  [conn conns _]
  (when (contains? @arena conn)
    (do
      (swap! arena disj conn)
      (doseq [c (conj @arena conn)]
        (.send c (packet "leave" (.data c "user")))))))


(defn login
  "Login user, i.e., attach user to connection."
  [conn conns user]
  (println "login")
  (if-not (some #(when-let [n (.data % "user")] (= user n)) @connections)
    (do
      (.data conn "user" user)
      (.send conn (packet "login" "ok")))
    (.send conn (packet "login" "name already in use"))))


(defn bad-type
  "Send an error response on unrecognized type."
  [conn _ _]
  (.send conn (packet "error" "Unrecognized type")))


(defn on-message
  [conn json]
  (let [msg     (json/read-json json)
        handler (case (:type msg)
                  "join"   join
                  "login"  login
                  "leave"  leave
                  :else    bad-type)]
    (handler conn @connections (:data msg))))


(defn on-close
  [conn]
  (swap! arena disj conn)
  (swap! connections disj conn))


(defn on-open
  [conn]
  (swap! connections conj conn))


(defn -main
  []
  (doto (WebServers/createWebServer 8080)
    (.add (StaticFileHandler. "./web"))
    (.add "/websocket"
          (reify org.webbitserver.WebSocketHandler
            (onOpen [_ conn]  (on-open conn))
            (onClose [_ conn] (on-close conn))
            (^void onMessage [_ ^WebSocketConnection conn ^String json] (on-message conn json))))
    (.start)))
