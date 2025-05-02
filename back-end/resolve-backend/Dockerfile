# Use Maven to build the Spring Boot app
FROM maven:3.9.5-jdk-11-slim AS builder
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# Use a slim JDK image to run the app
FROM openjdk:17-jdk-slim
WORKDIR /app
COPY --from=builder /app/target/resolve-backend-1.0-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java","-jar","app.jar"] 