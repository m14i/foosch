(ns foosch.core
  (:require [clojure.data.json :as json])
  (:import [org.webbitserver WebServer WebServers WebSocketHandler]
           [org.webbitserver.handler StaticFileHandler]))

(def players (atom #{}))

(defn add-player
  [player]
  (swap! players conj player))

(defn remove-player
  [player]
  (swap! players disj player))

(defn list-players
  []
  @players)

(defn on-message
  [conn json]
  (let [msg  (json/read-json json)
        type (:type msg)
        data (:data msg)
        resp (case type
               "add"    (add-player data)
               "remove" (remove-player data)
               "list"   (list-players)
               :else    (str "Unrecognized type" type))]
    (.send conn (json/json-str {:type type :data resp}))))

(defn -main
  []
  (doto (WebServers/createWebServer 8080)
    (.add "/websocket"
          (proxy [WebSocketHandler] []
            (onOpen [c] (println "opened" c))
            (onClose [c] (println "closed" c))
            (onMessage [c j] (on-message c j))))
    (.add (StaticFileHandler. "."))
    (.start)))
