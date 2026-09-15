using System.Security.Claims;
using Gestao.Application.Common.Interfaces;
using Microsoft.AspNetCore.Http;

namespace Gestao.Infrastructure.Services;

public class CurrentUserService : ICurrentUserService
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CurrentUserService(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public string? UserId => _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value 
                             ?? _httpContextAccessor.HttpContext?.User?.FindFirst("sub")?.Value;

    public string? UserName => _httpContextAccessor.HttpContext?.User?.FindFirst("preferred_username")?.Value 
                               ?? _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.Name)?.Value;
}
