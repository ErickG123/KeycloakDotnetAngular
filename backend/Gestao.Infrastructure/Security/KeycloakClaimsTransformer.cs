using System.Security.Claims;
using System.Text.Json;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.DependencyInjection;

namespace Gestao.Infrastructure.Security;

public static class KeycloakClaimsTransformer
{
    public static Task HandleClaimsTransformation(TokenValidatedContext context)
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

            // Extrai as roles do objeto realm_access
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
                            if (!string.IsNullOrEmpty(roleValue))
                            {
                                claimsIdentity.AddClaim(new Claim(ClaimTypes.Role, roleValue));
                            }
                        }
                    }
                }
                catch
                {
                    // Ignora parsing invalido de realm_access se houver
                }
            }
        }

        return Task.CompletedTask;
    }
}
