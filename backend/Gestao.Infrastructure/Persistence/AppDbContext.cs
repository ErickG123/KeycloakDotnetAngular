using Gestao.Domain.Entities;
using Gestao.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Gestao.Infrastructure.Persistence;

public class AppDbContext : DbContext, Gestao.Application.Common.Interfaces.IAppDbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Documento> Documentos => Set<Documento>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Documento>(builder =>
        {
            builder.HasKey(d => d.Id);
            builder.Property(d => d.Titulo).IsRequired().HasMaxLength(200);
            builder.Property(d => d.Descricao).HasMaxLength(1000);
            builder.Property(d => d.CriadoPor).IsRequired().HasMaxLength(150);
            builder.Property(d => d.DataCriacao).IsRequired();
        });
    }
}
