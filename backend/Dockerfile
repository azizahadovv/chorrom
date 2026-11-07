# CHORROM API — Spring Boot (Java 21)
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /src
COPY pom.xml .
RUN mvn -q -B dependency:go-offline
COPY src ./src
RUN mvn -q -B -DskipTests package

# glibc'li JRE (webp-imageio native kutubxonasi Alpine/musl'da ishlamaydi)
FROM eclipse-temurin:21-jre
RUN useradd --system --uid 10001 chorrom && mkdir -p /data/uploads && chown -R chorrom /data
WORKDIR /app
COPY --from=build /src/target/chorrom-api.jar app.jar
USER chorrom
ENV UPLOAD_DIR=/data/uploads \
    JAVA_TOOL_OPTIONS="-XX:MaxRAMPercentage=70 -XX:+ExitOnOutOfMemoryError"
EXPOSE 8080
# start-period katta: birinchi ishga tushishda eski bazadan rasmlar bilan import bo'ladi
HEALTHCHECK --interval=10s --timeout=5s --start-period=5m --retries=6 \
  CMD ["bash", "-c", "exec 3<>/dev/tcp/127.0.0.1/8080 && printf 'GET /actuator/health/readiness HTTP/1.0\r\n\r\n' >&3 && grep -q UP <&3"]
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
