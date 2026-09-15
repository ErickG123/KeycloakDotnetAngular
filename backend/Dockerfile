# Build Stage
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copiar arquivos de projeto e restaurar dependencias
COPY ["Gestao.API/Gestao.API.csproj", "Gestao.API/"]
COPY ["Gestao.Application/Gestao.Application.csproj", "Gestao.Application/"]
COPY ["Gestao.Domain/Gestao.Domain.csproj", "Gestao.Domain/"]
COPY ["Gestao.Infrastructure/Gestao.Infrastructure.csproj", "Gestao.Infrastructure/"]

RUN dotnet restore "Gestao.API/Gestao.API.csproj"

# Copiar todo o código-fonte e realizar o build
COPY . .
WORKDIR "/src/Gestao.API"
RUN dotnet build "Gestao.API.csproj" -c Release -o /app/build

# Publish Stage
FROM build AS publish
RUN dotnet publish "Gestao.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Runtime Stage
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
EXPOSE 5000
ENV ASPNETCORE_URLS=http://+:5000
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Gestao.API.dll"]
