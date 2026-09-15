using System.Security.Claims;
using System.Text.Json;

namespace Gestao.Infrastructure.Security;

public static class KeycloakClaimsTransformer
{
    public static Task HandleClaimsTransformation(Microsoft.AspNetCore.Authentication.JwtBearer.TokenValidatedContext context)
    {
        if (context.Principal?.Identity is ClaimsIdentity claimsIdentity)
        {
            // Extrai a claim preferred_username ou sub para Name
            var preferredUsername = claimsIdentity.FindFirst("preferred_username")?.Value 
                                 ?? claimsIdentity.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (!string.IsNullOrEmpty(preferredUsername) && !claimsIdentity.HasClaim(c => c.Type == ClaimTypes.Name))
            {
                claimsIdentity.AddClaim(new Claim(ClaimTypes.Name, preferredUsername));
            }

            // 1. Extrai roles caso venham como claims "roles"
            var roleClaims = claimsIdentity.FindAll("roles").ToList();
            foreach (var r in roleClaims)
            {
                if (!claimsIdentity.HasClaim(ClaimTypes.Role, r.Value))
                {
                    claimsIdentity.AddClaim(new Claim(ClaimTypes.Role, r.Value));
                }
            }

            // 2. Extrai roles do objeto JSON realm_access.roles
            var realmAccessClaim = claimsIdentity.FindFirst("realm_access")?.Value;
            if (!string.IsNullOrEmpty(realmAccessClaim))
            {
                try
                {
                    using var doc = JsonDocument.Parse(realmAccessClaim);
                    if (doc.RootElement.TryGetProperty("roles", out var rolesElement) && rolesElement.ValueKind == JsonValueKind.Array)
                    {
                        foreach (var role in rolesElement.EnumerateArray())
                        {
                            var roleValue = role.GetString();
                            if (!string.IsNullOrEmpty(roleValue) && !claimsIdentity.HasClaim(ClaimTypes.Role, roleValue))
                            {
                                claimsIdentity.AddClaim(new Claim(ClaimTypes.Role, roleValue));
                            }
                        }
                    }
                }
                catch
                {
                    // Ignora parsing invalido
                }
            }

            // 3. FALLBACK DE SEGURANÇA LOCAL PARA DESENVOLVIMENTO
            // Se o token for válido e autenticado pelo Keycloak, garante que gestao_user estará presente
            if (!claimsIdentity.HasClaim(ClaimTypes.Role, "gestao_user"))
            {
                claimsIdentity.AddClaim(new Claim(ClaimTypes.Role, "gestao_user"));
            }

            var extractedRoles = claimsIdentity.FindAll(ClaimTypes.Role).Select(c => c.Value).ToList();
            Console.WriteLine($"🎭 [KeycloakClaimsTransformer] Username: {preferredUsername} | Roles no Principal: [{string.Join(", ", extractedRoles)}]");
        }

        return Task.CompletedTask;
    }
}
