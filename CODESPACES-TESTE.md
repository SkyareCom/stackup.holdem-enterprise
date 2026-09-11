# STACKUP ENTERPRISE — TESTE PRIVADO NO GITHUB CODESPACES

O repositório permanece privado. O Codespace inicia automaticamente o servidor de teste do app na porta 4173.

## COMO ABRIR

1. Abra o repositório `SkyareCom/gemeo.stackup-enterprise` no GitHub.
2. Clique em **Code**.
3. Abra a aba **Codespaces**.
4. Clique em **Create codespace on main**.
5. Aguarde o ambiente iniciar. A porta **4173** será encaminhada automaticamente com o nome **STACKUP ENTERPRISE - APP DE TESTE**.
6. O navegador deve abrir o app automaticamente. Se não abrir, vá à aba **Ports**, localize a porta **4173** e clique no ícone de abrir no navegador.

## SE O SERVIDOR NÃO ABRIR AUTOMATICAMENTE

No terminal do Codespace, execute:

```bash
bash .devcontainer/start-test.sh
```

Depois abra a porta 4173 na aba **Ports**.

## ATUALIZAR O TESTE

Quando houver novos commits no `main`, dentro do Codespace execute:

```bash
git pull
```

Depois recarregue a página do app. Se necessário, reinicie o servidor:

```bash
kill "$(cat /tmp/stackup-enterprise-test.pid)" 2>/dev/null || true
bash .devcontainer/start-test.sh
```

## PRIVACIDADE

Mantenha a visibilidade da porta do Codespace como **Private** enquanto o app estiver em fase de testes.
