# Multi-stage build: compile with Maven, run with a slim JRE (keeps the final image small,
# which matters on Render's free tier where image pull time counts toward cold start)

FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn package -DskipTests -B

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

# Render sets PORT dynamically — application.yml already reads ${PORT:8080}
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
