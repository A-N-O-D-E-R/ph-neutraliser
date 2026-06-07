# Build stage
FROM eclipse-temurin:25.0.3_9-jdk-noble AS build

WORKDIR /app

COPY . .

RUN --mount=type=secret,id=settings,dst=/root/.m2/settings.xml \
    chmod +x mvnw && ./mvnw clean package -DskipTests

# Runtime stage
FROM eclipse-temurin:25.0.3_9-jre-noble
WORKDIR /app

COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
