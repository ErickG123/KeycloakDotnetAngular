using System.Security.Claims;
using Gestao.Application.Common.Interfaces;
using Gestao.Application.Documentos.Commands;
using Gestao.Infrastructure.Persistence;
using Gestao.Infrastructure.Security;
using Gestao.Infrastructure.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<ICurrentUserService, CurrentUserService>();

// EF Core com PostgreSQL
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") 
    ?? "Host=localhost;Database=app_db;Username=app_user;Password=app_password";

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString));

builder.Services.AddScoped<IAppDbContext>(provider => provider.GetRequiredService<AppDbContext>());

// MediatR CQRS
builder.Services.AddMediatR(cfg => 
    cfg.RegisterServicesFromAssembly(typeof(CreateDocumentoCommand).Assembly));

// Autenticação OIDC / Keycloak
var authority = builder.Configuration["Jwt:Authority"] ?? "http://localhost:8080/realms/gestao-realm";
var validIssuer = builder.Configuration["Jwt:ValidIssuer"] ?? "http://localhost:8080/realms/gestao-realm";

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.Authority = authority;
    options.RequireHttpsMetadata = false; // Permite HTTP para desenvolvimento local
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidIssuers = new[] { validIssuer, "http://localhost:8080/realms/gestao-realm", "http://keycloak:8080/realms/gestao-realm" },
        ValidateAudience = false, // Desativado temporariamente para ambiente local (evita rejeição se aud for account ou diferente)
        ValidateLifetime = true,
        ClockSkew = TimeSpan.FromSeconds(30)
    };

    options.Events = new JwtBearerEvents
    {
        OnAuthenticationFailed = context =>
        {
            Console.WriteLine($"❌ [JwtBearer Error]: Autenticação falhou! Motivo: {context.Exception.Message}");
            return Task.CompletedTask;
        },
        OnTokenValidated = context =>
        {
            Console.WriteLine($"✅ [JwtBearer Success]: Token validado com sucesso para o usuário: {context.Principal?.Identity?.Name}");
            return KeycloakClaimsTransformer.HandleClaimsTransformation(context);
        }
    };
});

// Políticas de Autorização por Roles do Keycloak
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("gestao_user", policy => policy.RequireRole("gestao_user"));
    options.AddPolicy("gestao_admin", policy => policy.RequireRole("gestao_admin"));
});

// CORS para permitir requisições do Angular
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngular", policy =>
    {
        policy.WithOrigins("http://localhost:4200", "http://localhost:80", "http://localhost")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

var app = builder.Build();

// Executa migrations automaticamente se necessário
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.EnsureCreated();
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// 1. CORS deve vir estritamente PRIMEIRO
app.UseCors("AllowAngular");

// 2. DEPOIS Autenticação
app.UseAuthentication();

// 3. DEPOIS Autorização
app.UseAuthorization();

app.MapControllers();

app.Run();
