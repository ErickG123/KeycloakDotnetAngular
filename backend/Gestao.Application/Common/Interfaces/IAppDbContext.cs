namespace Gestao.Application.Common.Interfaces;

public interface IAppDbContext
{
    Microsoft.EntityFrameworkCore.DbSet<Gestao.Domain.Entities.Documento> Documentos { get; }
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
