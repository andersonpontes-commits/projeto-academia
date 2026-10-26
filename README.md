# 🏋️ FitTrack Pro - Treino, Nutrição (TACO), Hidratação & Bioimpedância

Web App Mobile-First projetado sob medida para acompanhamento pessoal na academia, dieta e evolução física, sem anúncios e sem necessidade de tela de login/senha.

---

## 🌟 Funcionalidades Implementadas

1. **🍽️ Dieta & Nutrição (Tabela TACO / TBCA):**
   - Mais de 40 alimentos brasileiros e suplementos pré-calibrados por 100g (arroz, feijão, frango, patinho, ovos, whey, etc.).
   - Cálculo automático proporcional ao peso em gramas/ml.
   - Divisão em refeições: *Café da Manhã, Almoço, Café da Tarde, Jantar e Ceia*.
   - Resumo dinâmico de macros diários (Calorias, Proteínas, Carboidratos, Gorduras).
   - Suporte a busca online de produtos adicionais no Open Food Facts.

2. **💧 Hidratação Inteligente:**
   - Barra visual de garrafa animada com preenchimento em tempo real.
   - Botões de adição rápida: `+250ml`, `+500ml`, `+1.000ml`.
   - Meta diária configurável.

3. **📊 Peso & Bioimpedância:**
   - Registro de Peso (kg), % de Gordura corporal (BF) e % de Massa Magra.
   - **Gráfico de Evolução SVG**: curva suave com gradiente neon mostrando seu progresso ao longo dos dias/semanas.
   - Histórico completo de medições com data e observações.

4. **⚡ Cronograma de Treinos & Temporizador de Descanso:**
   - Divisão semanal personalizável (Segunda a Domingo).
   - Treinos de Peito & Tríceps, Costas & Bíceps, Pernas, Ombros/Abdômen, Braços/Superiores pré-montados.
   - Edição de cargas (kg) e repetições por série.
   - **Rest Timer Automático**: ao marcar uma série como concluída (`✓`), o temporizador flutuante de descanso é disparado instantaneamente (com beeps via Web Audio API e vibração no celular).
   - Presets de descanso: 45s, 60s, 90s, 120s, 180s e botão `+15s`.

5. **📱 PWA & Offline:**
   - Funciona 100% offline via Service Worker e LocalStorage.
   - Botão para exportar e importar arquivo de backup JSON com 1 clique.
   - Preparado para sincronização em nuvem via Firebase Firestore sem exigir telas de login com senha.

---

## 🚀 Como Executar Localmente

No terminal, dentro da pasta do projeto:
```bash
npm start
```
Abra seu navegador em: `http://localhost:3000`

---

## ☁️ Como Publicar no GitHub Pages ou Firebase

### Opção 1: GitHub Pages (Gratuito e Simples)
1. Crie um repositório no seu GitHub chamado `fit-track`.
2. No terminal:
   ```bash
   git init
   git add .
   git commit -m "FitTrack Pro v1.0"
   git remote add origin https://github.com/SEU-USUARIO/fit-track.git
   git push -u origin main
   ```
3. No GitHub: vá em **Settings** > **Pages** > Selecione a branch `main` e salve.
4. Seu app estará acessível em: `https://SEU-USUARIO.github.io/fit-track/`

### Opção 2: Firebase Hosting + Firestore (Com Sincronização em Nuvem)
1. Crie um projeto no [Console do Firebase](https://console.firebase.google.com/).
2. Ative o **Firestore Database** em modo de teste ou configure as regras para o seu usuário.
3. No app, vá na aba **Ajustes** e insira o seu `Project ID` e `API Key` do Firebase.
4. Clique em **Sincronizar Agora** para manter seus treinos e refeições sincronizados entre seu PC e seu celular!
