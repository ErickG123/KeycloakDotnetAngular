using Gestao.Application.Documentos.Commands;
using Gestao.Application.Documentos.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Gestao.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DocumentosController : ControllerBase
{
    private readonly IMediator _mediator;

    public DocumentosController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    [Authorize(Policy = "gestao_user")]
    public async Task<IActionResult> GetAll()
    {
        var result = await _mediator.Send(new GetDocumentosQuery());
        return Ok(result);
    }

    [HttpPost]
    [Authorize(Policy = "gestao_user")]
    public async Task<IActionResult> Create([FromBody] CreateDocumentoCommand command)
    {
        var id = await _mediator.Send(command);
        return CreatedAtAction(nameof(GetAll), new { id }, new { Id = id });
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Policy = "gestao_admin")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var deleted = await _mediator.Send(new DeleteDocumentoCommand(id));
        if (!deleted)
            return NotFound();

        return NoContent();
    }
}
