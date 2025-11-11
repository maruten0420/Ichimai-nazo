document.addEventListener('DOMContentLoaded', () => {
    
    // --- 設定 -------------------------------------------
    
    // 問題の総数
    const TOTAL_QUESTIONS = 10;
    
    // 各問題の解答リスト (複数の解答を許可)
    // テキストはチェック時に小文字化・全角英数を半角化して比較します
    const answers = {
        1: ["はいどく", "拝読", "ハイドク"],
        2: ["COOL", "cool"],

    };

// --- 変数 -------------------------------------------
    
    // localStorageからデータを読み込む（なければデフォルト値1）
    let currentQuestion = parseInt(localStorage.getItem('cyberRiddle_currentQuestion'), 10) || 1;
    let maxSolvedQuestion = parseInt(localStorage.getItem('cyberRiddle_maxSolvedQuestion'), 10) || 1;

    // currentQuestionが未解放の場所にいたらリセット
    if (currentQuestion > maxSolvedQuestion) {
        currentQuestion = maxSolvedQuestion;
    }
    // もし全問クリア後(11)になっていたら最後(10)に戻す
    if (currentQuestion > TOTAL_QUESTIONS) {
        currentQuestion = TOTAL_QUESTIONS;
    }


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
        return `question/question${qStr}.png`; // 変更：コメント解除
        
        // ▼▼▼ プレビュー環境用のダミーURL ▼▼▼
        // (近未来的なプレースホルダー画像)
        // return `https://placehold.co/800x600/0a0a1a/00ffff?text=Question+${qNum}`; // 変更：コメントアウト
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

        const isAllCleared = (maxSolvedQuestion > TOTAL_QUESTIONS); // 全問クリア判定

        for (let i = 1; i <= TOTAL_QUESTIONS; i++) {
            const box = document.createElement('div');
            box.classList.add('progress-box');
            
            // 要望2: クリック制御 (挑戦中までクリック可能)
            if (i <= maxSolvedQuestion || isAllCleared) {
                box.classList.add('clickable');
                box.title = `問題 ${i} に移動`;
                box.addEventListener('click', () => jumpToQuestion(i));
            } else {
                box.title = `問題 ${i} (未解放)`;
            }

            // 要望1: 色分け
            if (isAllCleared) {
                // 全問クリア後
                box.classList.add('unlocked');
            } else if (i < maxSolvedQuestion) {
                // ① 正解済み (青緑)
                box.classList.add('unlocked');
            } else if (i === maxSolvedQuestion) {
                // ② 現在挑戦中 (黄色)
                box.classList.add('challenging');
            }
            // ③ 未到達 (黒) はデフォルト

            
            // ③ 選択中 (ピンク) - 他の色を上書き
            if (i === currentQuestion) {
                box.classList.add('current');
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
        // (ただし、全問解いた後は無効)
        navRight.disabled = (currentQuestion >= maxSolvedQuestion || currentQuestion === TOTAL_QUESTIONS) && (maxSolvedQuestion <= TOTAL_QUESTIONS);
    }

    /**
     * 特定の問題にジャンプする (進捗バー・矢印用)
     * @param {number} qNum - 移動先の問題番号
     */
    function jumpToQuestion(qNum) {
        // 未解放の問題にはジャンプさせない（全問クリア後はOK）
        if (qNum > maxSolvedQuestion && maxSolvedQuestion <= TOTAL_QUESTIONS) return;
        
        // 範囲チェック
        if (qNum >= 1 && qNum <= TOTAL_QUESTIONS) {
            currentQuestion = qNum;
            localStorage.setItem('cyberRiddle_currentQuestion', currentQuestion); // 追加：localStorageに保存
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
                localStorage.setItem('cyberRiddle_maxSolvedQuestion', maxSolvedQuestion); // 追加：localStorageに保存
            }
            
            // 全問クリアチェック
            if (currentQuestion === TOTAL_QUESTIONS) {
                // maxSolvedQuestionを問題数より1大きくすることで「全問クリア」状態とする
                if (maxSolvedQuestion <= TOTAL_QUESTIONS) {
                    maxSolvedQuestion = TOTAL_QUESTIONS + 1; 
                    localStorage.setItem('cyberRiddle_maxSolvedQuestion', maxSolvedQuestion); // 追加：localStorageに保存
                }
                
                messageArea.textContent = '全問クリア！おめでとうございます！';
                updateArrows(); // 矢印を更新
                updateProgressBar(); // クリア状態を反映
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
    
    // 初期読み込み時の値チェック（リロード対策）
    if (currentQuestion > TOTAL_QUESTIONS) {
        currentQuestion = TOTAL_QUESTIONS;
    }
    // maxSolvedQuestionが不正な値（例：12以上）になっていたら補正
    if (maxSolvedQuestion > TOTAL_QUESTIONS + 1) {
         maxSolvedQuestion = TOTAL_QUESTIONS + 1;
    }


    updateUI(); // ページ読み込み時にUIを初期化

});
