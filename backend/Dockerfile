FROM ballerina/ballerina:2201.12.9 AS builder
WORKDIR /app
USER root
COPY . .
RUN bal build --sticky

FROM openjdk:21-slim
WORKDIR /app
COPY --from=builder /app/target/bin /app
EXPOSE 9090
CMD ["java", "-jar", "backend.jar"]