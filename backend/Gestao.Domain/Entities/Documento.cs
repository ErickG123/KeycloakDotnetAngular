using Gestao.Domain.Exceptions;

namespace Gestao.Domain.Entities;

public class Documento
{
    public Guid Id { get; private set; }
    public string Titulo { get; private set; } = string.Empty;
    public string Descricao { get; private set; } = string.Empty;
    public string CriadoPor { get; private set; } = string.Empty;
    public DateTime DataCriacao { get; private set; }

    private Documento() { }

    public Documento(string titulo, string descricao, string criadoPor)
    {
        Id = Guid.NewGuid();
        SetTitulo(titulo);
        SetDescricao(descricao);
        SetCriadoPor(criadoPor);
        DataCriacao = DateTime.UtcNow;
    }

    public void SetTitulo(string titulo)
    {
        if (string.IsNullOrWhiteSpace(titulo))
            throw new DomainException("O título do documento é obrigatório e não pode ser vazio.");
        
        if (titulo.Length > 200)
            throw new DomainException("O título não pode ter mais de 200 caracteres.");

        Titulo = titulo.Trim();
    }

    public void SetDescricao(string descricao)
    {
        if (descricao?.Length > 1000)
            throw new DomainException("A descrição não pode exceder 1000 caracteres.");

        Descricao = descricao?.Trim() ?? string.Empty;
    }

    private void SetCriadoPor(string criadoPor)
    {
        if (string.IsNullOrWhiteSpace(criadoPor))
            throw new DomainException("O identificador do criador é obrigatório.");

        CriadoPor = criadoPor.Trim();
    }
}
