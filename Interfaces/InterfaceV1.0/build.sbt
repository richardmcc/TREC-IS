name := """SUPER-TweetWall"""

version := "1.0-SNAPSHOT"

lazy val root = (project in file(".")).enablePlugins(PlayScala)

scalaVersion := "2.11.5"

libraryDependencies ++= Seq(
  ws, // Play's web services module
  "com.typesafe.akka" %% "akka-actor" % "2.3.9",
  "com.typesafe.akka" %% "akka-slf4j" % "2.3.9",
  "org.webjars" % "bootstrap" % "3.0.0",
  "org.webjars" % "flot" % "0.8.0",
  "com.typesafe.akka" %% "akka-testkit" % "2.3.9" % "test",
  "org.json" % "json" % "20090211",
  "com.flickr4java" % "flickr4java" % "2.12",
  "com.likethecolor" % "alchemy" % "1.1.6",
  "net.ettinsmoor" % "bingerator_2.10" % "0.2.2",
  "org.scala-lang" % "scala-library" % "2.10.0-M3",
  "com.google.code.gson" % "gson" % "2.3.1",
  "org.glassfish.jersey.core" % "jersey-client" % "2.5",
  "com.fasterxml.jackson.core" % "jackson-core" % "2.3.0",
  "com.fasterxml.jackson.core" % "jackson-databind" % "2.3.0",
  "org.apache.thrift" % "libthrift" % "0.9.1",
  "com.github.mpkorstanje" % "simmetrics-core" % "3.0.1",
  "com.github.rholder" % "snowball-stemmer" % "1.3.0.581.1",
  "com.typesafe.play" % "play-java_2.11" % "2.3.9",
  "org.mapdb" % "mapdb" % "3.0.5",
  "org.terrier.superfp7" % "superfp7-api-client" % "1.1.6"
)

resolvers += "typesafe2" at "http://repo.typesafe.com/typesafe/maven-releases/"
resolvers += "aspectj" at "http://repo1.maven.org/maven2/"
resolvers += "richardlocal" at "file:///local/tr.kba/.m2/"


fork in run := true
