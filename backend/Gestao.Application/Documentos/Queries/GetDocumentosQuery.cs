using Gestao.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Gestao.Application.Documentos.Queries;

public record DocumentoDto(Guid Id, string Titulo, string Descricao, string CriadoPor, DateTime DataCriacao);

public record GetDocumentosQuery : IRequest<List<DocumentoDto>>;

public class GetDocumentosQueryHandler : IRequestHandler<GetDocumentosQuery, List<DocumentoDto>>
{
    private readonly IAppDbContext _context;

    public GetDocumentosQueryHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<List<DocumentoDto>> Handle(GetDocumentosQuery request, CancellationToken cancellationToken)
    {
        return await _context.Documentos
            .AsNoTracking()
            .OrderByDescending(d => d.DataCriacao)
            .Select(d => new DocumentoDto(d.Id, d.Titulo, d.Descricao, d.CriadoPor, d.DataCriacao))
            .ToListAsync(cancellationToken);
    }
}
