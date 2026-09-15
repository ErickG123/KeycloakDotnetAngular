using Gestao.Application.Common.Interfaces;
using Gestao.Domain.Entities;
using MediatR;

namespace Gestao.Application.Documentos.Commands;

public record CreateDocumentoCommand(string Titulo, string Descricao) : IRequest<Guid>;

public class CreateDocumentoCommandHandler : IRequestHandler<CreateDocumentoCommand, Guid>
{
    private readonly IAppDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public CreateDocumentoCommandHandler(IAppDbContext context, ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<Guid> Handle(CreateDocumentoCommand request, CancellationToken cancellationToken)
    {
        var criadoPor = _currentUserService.UserName ?? _currentUserService.UserId ?? "desconhecido";
        var documento = new Documento(request.Titulo, request.Descricao, criadoPor);

        _context.Documentos.Add(documento);
        await _context.SaveChangesAsync(cancellationToken);

        return documento.Id;
    }
}
