# Stage 1: Build .NET Web API
FROM mcr.microsoft.com/dotnet/sdk:10.0-preview AS build
WORKDIR /app

COPY *.csproj ./
RUN dotnet restore

COPY . ./
RUN dotnet publish -c Release -o /app/publish

# Stage 2: Runtime image
FROM mcr.microsoft.com/dotnet/aspnet:10.0-preview
WORKDIR /app
COPY --from=build /app/publish .

EXPOSE 5140
ENV ASPNETCORE_URLS=http://+:5140
ENTRYPOINT ["dotnet", "CrmEmailService.dll"]
