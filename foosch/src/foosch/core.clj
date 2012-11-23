(ns foosch.core
  (:require [clojure.data.json :as json])
  (:import [org.webbitserver WebServer WebServers WebSocketHandler WebSocketConnection]
           [org.webbitserver.handler StaticFileHandler]
           [java.util Calendar Locale]
           [java.text DateFormat SimpleDateFormat]))


(def connections (atom #{}))
(def users (atom #{}))
(def arena (atom #{}))

(def transcript (atom '()))
(def transcript-size 10)

(def time-formatter (SimpleDateFormat. "HH:mm:ss"))


(defn packet
  [type data]
  (json/json-str {:type type :data data}))


(defn arena-full?
  [arena]
  (< 3 (count arena)))


(defn get-data
  [key conn]
  (.data conn (name key)))


(defn set-data
  [key val conn]
  (.data conn (name key) val))


(defn join
  "Add user to the 'arena' and notify others in the arena that a new user has joined."
  [conn _]
  (when (contains? @users conn)  ;; user must be logged in to join
    (swap! arena conj conn)
    (if (arena-full? @arena)
      (let [players (take 4 @arena)
            names   (map (partial get-data :user) players)]
        (swap! arena #(apply disj %1 %2) players)
        (doseq [c players]
          (.send c (packet "play" names))))
      (let [names (map (partial get-data :user) @arena)]
        (.send conn (packet "join" "ok"))
        (doseq [c @arena]
          (.send c (packet "arena" names)))))))


(defn leave
  "Remove user from 'arena' and notify others that a user has left."
  [conn _]
  (when (contains? @arena conn)
    (swap! arena disj conn)
    (.send conn (packet "leave" "ok"))
    (let [names (map #(.data % "user") @arena)]
      (doseq [c (conj @arena conn)]
        (.send c (packet "arena" names))))))


(defn login
  "Login user, i.e., attach user to connection."
  [conn user]
  (if-not (some #(when-let [n (get-data :user %)] (= user n)) @users)
    (do
      (set-data :user user conn)
      (swap! users conj conn)
      (.send conn (packet "login" user))

      ;; let the new user see what people have been chatting about
      (doseq [line (reverse (take transcript-size @transcript))]
        (.send conn (packet "say" line)))

      (let [names (map (partial get-data :user) @users)]
        (doseq [c @connections]
          (.send c (packet "users" names)))))

    (.send conn (packet "error" "name already in use"))))


(defn timestamp
  []
  (->> (Calendar/getInstance) .getTime (.format time-formatter)))


(defn say
  "Broadcast chat message to all who are logged in"
  [conn msg]
  (when-let [user (get-data :user conn)]
    (let [time (timestamp)
          line (str time " " user ": " msg)]
      (swap! transcript #(conj (take transcript-size %1) %2) line)
      (doseq [u @users]
        (.send u (packet "say" line))))))


(defn bad-type
  "Send an error response on unrecognized type."
  [conn _]
  (.send conn (packet "error" "Unrecognized type")))


(defn on-message
  [conn json]
  (let [msg     (json/read-json json)
        handler (case (:type msg)
                  "join"   join
                  "login"  login
                  "leave"  leave
                  "say"    say
                  :else    bad-type)]
    (handler conn (:data msg))))


(defn on-close
  [conn]
  (swap! arena disj conn)
  (swap! users disj conn)
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
            (onOpen  [_ conn] (on-open conn))
            (onClose [_ conn] (on-close conn))
            (^void onMessage [_ ^WebSocketConnection conn ^String json] (on-message conn json))))
    (.start)))


