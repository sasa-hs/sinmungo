/* 회차별 설정 */
const ROUNDS = [
    {
        semester: "26-1학기",
        round: "1회차",
        receiptStart: "2026-02-03",
        receiptEnd: "2026-02-04",
        processStart: "2026-02-05",
        processEnd: "2026-12-27",
        config: {
            action: "https://docs.google.com/forms/d/e/1FAIpQLScsIHRmF0CL0ZrA2zy7RmqK-8Gu9lDcgr8s0i1fc83M2HnRpA/formResponse",
            entryName: "entry.1137083251",
            entryBody: "entry.1184900454"
        }
    },
    {
        semester: "26-1학기",
        round: "2회차",
        receiptStart: "2026-12-28",
        receiptEnd: "2026-12-29",
        processStart: "2026-12-30",
        processEnd: "2026-12-31",
        config: {
            action: "https://docs.google.com/forms/d/e/1FAIpQLScPkinnHaQFcwwGLvIHPuNZ8lt89Ghk8RMNceeMLnMOGyvcAQ/formResponse",
            entryName: "entry.1137083251",
            entryBody: "entry.1184900454"
        }
    }
];

const pad = n => String(n).padStart(2, '0');
const now = new Date(); now.setHours(0, 0, 0, 0);
const pd = s => { const [y, m, d] = s.split('-'); const dt = new Date(y, m - 1, d); dt.setHours(0, 0, 0, 0); return dt };
const ko = s => { const [y, m, d] = s.split('-'); return `${y}년 ${+m}월 ${+d}일` };

document.getElementById('todayLabel').textContent = `${now.getFullYear()}. ${pad(now.getMonth() + 1)}. ${pad(now.getDate())}`;

let cur = null, status = 'closed';
for (const r of ROUNDS) {
    const rs = pd(r.receiptStart), re = pd(r.receiptEnd), ps = pd(r.processStart), pe = pd(r.processEnd);
    if (now >= rs && now <= re) { cur = r; status = 'open'; break; }
    if (now >= ps && now <= pe) { cur = r; status = 'processing'; break; }
}
if (!cur) cur = ROUNDS[ROUNDS.length - 1];

// UI 업데이트 로직
if (cur) {
    document.getElementById('roundLabel').textContent = cur.semester + ' ' + cur.round;
    document.getElementById('roundMeta').innerHTML = `접수 <strong>${ko(cur.receiptStart)} – ${ko(cur.receiptEnd)}</strong><br>처리 <strong>${ko(cur.processStart)} – ${ko(cur.processEnd)}</strong>`;
    const pill = document.getElementById('statusPill');
    pill.textContent = status === 'open' ? '접수 중' : (status === 'processing' ? '처리 중' : '종료');
    pill.className = `status-pill s-${status}`;
}

const aside = `
<aside class="info-side">
  <div class="aside-block">
    <h3>일정 안내</h3>
    <div class="date-row"><span class="dr-key">접수 시작</span><span class="dr-val">${ko(cur.receiptStart)}</span></div>
    <div class="date-row"><span class="dr-key">접수 마감</span><span class="dr-val">${ko(cur.receiptEnd)}</span></div>
    <div class="date-row"><span class="dr-key">처리 시작</span><span class="dr-val">${ko(cur.processStart)}</span></div>
    <div class="date-row"><span class="dr-key">처리 마감</span><span class="dr-val">${ko(cur.processEnd)}</span></div>
  </div>
  <div class="notice-aside">
    <h3>유의사항</h3>
    <p>제출하신 건의 내용은 검토 후 온라인으로 공유될 수 있습니다. 개인정보 노출에 유의하여 작성해주세요.</p>
  </div>
</aside>`;

const grid = document.getElementById('bodyGrid');

window.initSinmungo = function (userName) {
    if (status === 'open') {
        grid.innerHTML = `
        <div class="form-side">
          <p class="section-eyebrow">건의사항 접수</p>
          <h2 class="section-heading">학교 생활의<br><em>불편함을 알려주세요</em></h2>
          <form id="sgForm">
            <div class="field-block">
              <label>학번 · 이름 <span class="opt">(선택, 미입력 시 익명)</span></label>
              <input type="text" name="${cur.config.entryName}" placeholder="예) 0000 홍길동"/>
            </div>
            <div class="field-block">
              <label>건의 내용</label>
              <textarea name="${cur.config.entryBody}" maxlength="1000" id="ta" placeholder="학교 생활 중 개선이 필요한 점을 자유롭게 적어주세요."></textarea>
              <div class="char-hint"><span id="cn">0</span> / 1000</div>
            </div>
            <button type="submit" class="submit-btn">제출하기</button>
          </form>
        </div>${aside}`;

        const ta = document.getElementById('ta'), cn = document.getElementById('cn');
        ta.addEventListener('input', () => cn.textContent = ta.value.length);

        document.getElementById('sgForm').addEventListener('submit', function (e) {
            e.preventDefault();
            if (!ta.value.trim()) { alert('건의 내용을 입력해주세요.'); return; }
            if (new Date() > pd(cur.receiptEnd)) { alert('접수 기간이 종료되었습니다.'); return; }

            fetch(cur.config.action, { method: 'POST', mode: 'no-cors', body: new FormData(this) })
                .then(() => {
                    grid.innerHTML = `<div class="success-wrap"><h2>Thank you.</h2><p>건의사항이 접수되었습니다.<br>처리 기간 중 검토 후 안내드리겠습니다.</p></div>`;
                })
                .catch(() => alert('오류가 발생했습니다.'));
        });
    } else if (status === 'processing') {
        const roundNum = pad(cur.round.replace(/[^0-9]/g, ''));

        grid.innerHTML = `
        <div class="state-msg">
          <div class="state-num">${roundNum}</div>
          <div class="state-text">
            <h2>처리 기간입니다</h2>
            <p>이번 회차 접수가 마감되었습니다.<br>${ko(cur.processStart)} – ${ko(cur.processEnd)} 동안 건의사항을 검토합니다.</p>
          </div>
        </div>${aside}`;
    } else {
        grid.innerHTML = `<div class="state-msg"><div class="state-num">—</div><div class="state-text"><h2>현재 접수 기간이 아닙니다</h2><p>다음 회차 일정을 기다려주세요.</p></div></div>${aside}`;
    }
};

if (status === 'open') {
    document.getElementById('authContainer').style.display = 'flex';
} else {
    window.initSinmungo();
}

