using Gestao.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Gestao.Application.Documentos.Commands;

public record DeleteDocumentoCommand(Guid Id) : IRequest<bool>;

public class DeleteDocumentoCommandHandler : IRequestHandler<DeleteDocumentoCommand, bool>
{
    private readonly IAppDbContext _context;

    public DeleteDocumentoCommandHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(DeleteDocumentoCommand request, CancellationToken cancellationToken)
    {
        var documento = await _context.Documentos.FirstOrDefaultAsync(d => d.Id == request.Id, cancellationToken);
        if (documento == null)
            return false;

        _context.Documentos.Remove(documento);
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}
