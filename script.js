document.addEventListener('DOMContentLoaded', () => {
    
    // --- 設定  -------------------------------------------
    
    // 問題の総数
    const TOTAL_QUESTIONS = 10;
    
    // 各問題の解答リスト  (複数の解答を許可)
    // テキストはチェック時に小文字化・全角英数を半角化して比較します
    const answers = {
        1: ["はいどく", "ハイドク", "拝読"],
        2: ["cool", "COOL"],
    };

    // --- 変数 -------------------------------------------
    
    let currentQuestion = 1; // 現在の問題番号 (1から)
    let maxSolvedQuestion = 1; // 解放済みの最大問題番号 (1から)

    // --- DOM要素 ----------------------------------------
    
    const progressBar = document.getElementById('progress-bar');
    const riddleImage = document.getElementById('riddle-image');
    const navLeft = document.getElementById('nav-left');
    const navRight = document.getElementById('nav-right');
    const answerForm = document.getElementById('answer-form');
    const answerInput = document.getElementById('answer-input');
    const messageArea = document.getElementById('message-area');

    // --- 関数 -------------------------------------------

    /**
     * 問題画像のURLを取得する
     * @param {number} qNum - 問題番号
     * @returns {string} 画像URL
     */
    function getQuestionImageUrl(qNum) {
        const qStr = String(qNum).padStart(3, '0');
        
        // ★★★ GitHubにアップロードする際はこちらを有効にしてください ★★★
        // return `question/question${qStr}.png`;
        
        // ▼▼▼ プレビュー環境用のダミーURL ▼▼▼
        // (近未来的なプレースホルダー画像)
        return `https://placehold.co/800x600/0a0a1a/00ffff?text=Question+${qNum}`;
        // ▲▲▲ GitHubアップ時はこの行を削除またはコメントアウト ▲▲▲
    }

    /**
     * UI全体を現在の状態に基づいて更新する
     */
    function updateUI() {
        // 画像の更新
        riddleImage.src = getQuestionImageUrl(currentQuestion);
        riddleImage.alt = `問題 ${currentQuestion}`;

        // 進捗バーの更新
        updateProgressBar();

        // 矢印の更新
        updateArrows();
        
        // 解答欄とメッセージのリセット
        answerInput.value = '';
        messageArea.textContent = '';
        messageArea.className = '';
    }

    /**
     * 進捗バーを更新する
     */
    function updateProgressBar() {
        progressBar.innerHTML = ''; // 中身をクリア

        for (let i = 1; i <= TOTAL_QUESTIONS; i++) {
            const box = document.createElement('div');
            box.classList.add('progress-box');
            
            if (i < maxSolvedQuestion) {
                // 解放済み
                box.classList.add('unlocked');
                box.title = `問題 ${i} に移動`;
                box.addEventListener('click', () => jumpToQuestion(i));
            } else if (i === maxSolvedQuestion) {
                // 現在挑戦中または次の問題
                if (i === currentQuestion) {
                    box.classList.add('current');
                    box.title = `現在の問題 ${i}`;
                } else {
                    // まだ到達していない（maxSolvedQuestionが更新されるとunlockedになる）
                    box.title = `問題 ${i} (未解放)`;
                }
            } else {
                // 未解放
                box.title = `問題 ${i} (未解放)`;
            }

            progressBar.appendChild(box);
        }
    }

    /**
     * 左右の矢印の有効/無効を切り替える
     */
    function updateArrows() {
        // 左矢印: 1問目より前には行けない
        navLeft.disabled = (currentQuestion === 1);
        
        // 右矢印: 解放済みの最大問題より先には行けない
        // (ただし、全問解いた後も無効)
        navRight.disabled = (currentQuestion >= maxSolvedQuestion || currentQuestion === TOTAL_QUESTIONS);
    }

    /**
     * 特定の問題にジャンプする (進捗バー・矢印用)
     * @param {number} qNum - 移動先の問題番号
     */
    function jumpToQuestion(qNum) {
        // 未解放の問題にはジャンプさせない
        if (qNum > maxSolvedQuestion) return;
        
        // 範囲チェック
        if (qNum >= 1 && qNum <= TOTAL_QUESTIONS) {
            currentQuestion = qNum;
            updateUI();
        }
    }

    /**
     * 解答を正規化する (比較用)
     * @param {string} input - ユーザーの入力
     * @returns {string} 正規化された文字列
     */
    function normalizeAnswer(input) {
        return input
            .trim() // 前後の空白削除
            .toLowerCase() // 小文字化
            .replace(/[Ａ-Ｚａ-ｚ０-９]/g, (s) => { // 全角英数を半角に
                return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
            });
    }

    /**
     * 解答をチェックする
     * @param {Event} e - フォーム送信イベント
     */
    function checkAnswer(e) {
        e.preventDefault(); // ページリロード防止
        const userInput = normalizeAnswer(answerInput.value);
        
        if (userInput === '') return; // 空欄は無視

        const correctAnswers = answers[currentQuestion].map(normalizeAnswer);

        if (correctAnswers.includes(userInput)) {
            // --- 正解 ---
            messageArea.textContent = '正解！';
            messageArea.className = 'message-correct';

            // 現在の問題が解放済みの最大問題だった場合、次の問題に進む権利を得る
            if (currentQuestion === maxSolvedQuestion && currentQuestion < TOTAL_QUESTIONS) {
                maxSolvedQuestion++;
            }
            
            // 全問クリアチェック
            if (currentQuestion === TOTAL_QUESTIONS) {
                messageArea.textContent = '全問クリア！おめでとうございます！';
                updateArrows(); // 矢印を両方無効化
                updateProgressBar(); // 進捗バーを最終状態に
                return;
            }

            // 0.5秒後に次の問題へ
            setTimeout(() => {
                jumpToQuestion(currentQuestion + 1);
            }, 500);

        } else {
            // --- 不正解 ---
            messageArea.textContent = '不正解...';
            messageArea.className = 'message-wrong';
            answerInput.value = ''; // 不正解なら入力欄をクリア
        }
    }

    // --- イベントリスナー設定 -------------------------------
    
    // 矢印ナビゲーション
    navLeft.addEventListener('click', () => {
        if (currentQuestion > 1) {
            jumpToQuestion(currentQuestion - 1);
        }
    });

    navRight.addEventListener('click', () => {
        if (currentQuestion < maxSolvedQuestion && currentQuestion < TOTAL_QUESTIONS) {
            jumpToQuestion(currentQuestion + 1);
        }
    });

    // 解答フォーム
    answerForm.addEventListener('submit', checkAnswer);

    // --- 初期化 -----------------------------------------
    
    updateUI(); // ページ読み込み時にUIを初期化

});
