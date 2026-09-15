using FluentAssertions;
using Gestao.Application.Common.Interfaces;
using Gestao.Application.Documentos.Commands;
using Gestao.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using NSubstitute;
using Xunit;

namespace Gestao.Application.Tests.Documentos;

public class CreateDocumentoCommandHandlerTests
{
    private readonly IAppDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly CreateDocumentoCommandHandler _handler;

    public CreateDocumentoCommandHandlerTests()
    {
        var options = new DbContextOptionsBuilder<MockDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        var dbContext = new MockDbContext(options);
        _context = dbContext;
        _currentUserService = Substitute.For<ICurrentUserService>();

        _handler = new CreateDocumentoCommandHandler(_context, _currentUserService);
    }

    [Fact]
    public async Task Handle_DeveCriarDocumentoComSucesso_QuandoDadosForemValidos()
    {
        // Arrange
        _currentUserService.UserName.Returns("user.comum");
        var command = new CreateDocumentoCommand("Projeto X", "Descrição do Projeto X");

        // Act
        var documentoId = await _handler.Handle(command, CancellationToken.None);

        // Assert
        documentoId.Should().NotBeEmpty();

        var docBanco = await _context.Documentos.FirstOrDefaultAsync(d => d.Id == documentoId);
        docBanco.Should().NotBeNull();
        docBanco!.Titulo.Should().Be("Projeto X");
        docBanco.Descricao.Should().Be("Descrição do Projeto X");
        docBanco.CriadoPor.Should().Be("user.comum");
    }

    private class MockDbContext : DbContext, IAppDbContext
    {
        public MockDbContext(DbContextOptions<MockDbContext> options) : base(options) { }
        public DbSet<Documento> Documentos => Set<Documento>();
    }
}
