name := "yidu-wap"

version := "4.0"

lazy val root = (project in file(".")).enablePlugins(PlayScala)

doc in Compile <<= target.map(_ / "none")

javacOptions ++= Seq("-source", "1.7", "-target", "1.7")

scalacOptions ++= Seq("-feature", "-deprecation", "-unchecked", "-language:reflectiveCalls", "-language:postfixOps", "-language:higherKinds")

includeFilter in(Assets, LessKeys.less) := "*.less"

excludeFilter in(Assets, LessKeys.less) := "_*.less"

LessKeys.compress in Assets := true




//pipelineStages in Assets := Seq(uglify)
//
//UglifyKeys.sourceMap := false
//
//UglifyKeys.uglifyOps := { js =>
//  Seq(
//    (js.filter(j => List("js/env.js", "js/apps.js", "articles/detail.js").contains(j._2)), "articles/detail.min.js")
//  )
//}
