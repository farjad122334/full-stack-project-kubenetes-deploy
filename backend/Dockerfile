# Stage 1: Build
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /app

# Copy csproj and restore dependencies
COPY backend.csproj ./
RUN dotnet restore

# Copy everything else
COPY . .

# Publish release build
RUN dotnet publish -c Release -o out

# Stage 2: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:9.0
WORKDIR /app

# Copy published files from build stage
COPY --from=build /app/out .

EXPOSE 8080

CMD ["dotnet", "backend.dll"]
