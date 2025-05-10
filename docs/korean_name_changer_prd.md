물론입니다. 아래는 당신이 요청한 내용을 바탕으로 작성한 **MVP 웹서비스 PRD (제품 요구사항 문서)**의 **한글 버전**입니다.

---

## 📄 제품 요구사항 문서 (PRD)

### 1. 개요 (Overview)

**프로젝트명:** Korean Name Changer

**설명:** 외국인의 이름을 한국식 이름으로 의미 있게 재해석해주는 시적 네이밍 웹서비스입니다. 이 서비스는 외국 이름을 가진 사용자들이 자신의 이름에 담긴 의미와 정서를 한국 문화의 아름다움과 연결하여 새로운 정체성을 탐색할 수 있도록 돕는 것을 목표로 합니다. 사용자가 자신의 외국 이름을 입력하면, 서비스는 그 이름의 어원, 상징, 느낌 등을 분석하여 한국적인 감성과 전통을 담은 아름다운 한국식 이름(성 포함)을 생성하고, 그 의미와 시적 해석을 함께 제공합니다.

**문제 해결:**

- 외국인들이 한국 문화에 대한 관심이 높아짐에 따라 한국식 이름을 갖고 싶어하는 수요가 있습니다.
- 단순히 발음만 비슷한 이름이 아닌, 자신의 본래 이름과 의미적으로 연결되는 깊이 있는 한국 이름을 찾기 어렵습니다.
- 문화적 배경과 언어적 뉘앙스를 이해하고 시적인 아름다움을 담아 이름을 짓는 것은 전문적인 지식을 필요로 합니다.

**대상 사용자:**

- 한국 문화에 관심 있는 외국인
- 한국인 친구나 동료와 더 깊은 유대감을 형성하고 싶은 외국인
- 자신의 아이에게 특별한 의미를 담은 한국식 이름을 지어주고 싶은 다문화 가정 부모
- 새로운 캐릭터나 필명을 구상하는 창작자

**가치 제안:**

- **의미 있는 연결:** 사용자의 본래 이름과 의미적으로 연결되는 아름다운 한국식 이름을 제공합니다.
- **시적 감성:** 단순한 번역을 넘어 시적이고 감성적인 해석을 더해 이름에 특별한 가치를 부여합니다.
- **문화적 이해:** 한국의 성씨와 이름에 담긴 문화적 배경과 의미를 함께 전달하여 한국 문화에 대한 이해를 높입니다.
- **간편한 사용성:** 직관적인 인터페이스를 통해 누구나 쉽게 자신만의 특별한 한국 이름을 만들 수 있습니다.

---

### 2. 핵심 기능 (Core Features)

#### 가. 이름 입력 UI

- **기능:** 사용자가 외국 이름(예: "Isabella Rossellini") 또는 이름만 입력할 수 있는 단일 입력창을 제공합니다.
- **중요성:** 서비스의 첫 관문으로, 사용자가 쉽게 상호작용을 시작할 수 있도록 합니다.
- **작동 방식:** 텍스트 입력 필드와 "한국 이름 생성" 버튼으로 구성되며, 입력된 값을 AI 모델에 전달하는 역할을 합니다. 반응형 디자인을 적용하여 모바일 환경에서도 사용성을 보장합니다.

#### 나. 결과 출력 영역

- **기능:** AI가 생성한 한국식 이름과 관련 정보를 시각적으로 명확하게 보여줍니다.
- **중요성:** 서비스의 핵심 가치를 전달하는 부분으로, 사용자가 생성된 이름에 만족하고 그 의미를 이해할 수 있도록 합니다.
- **작동 방식:** 아래 명시된 JSON 구조 기반의 데이터를 받아 카드 형태 등 가독성 높은 UI로 구성합니다.
  ```json
  {
    "original_name": "Sophia Loren",
    "korean_name": "이예지 (李藝智, Lee Ye-ji)",
    "connection_explanation": "'소피아'라는 이름은 그리스어로 '지혜'를 의미하며, 깊은 이해와 통찰력을 나타냅니다. 이는 '예술적 지혜' 또는 '교양 있는 지성'을 의미하는 한국 이름 '예지(藝智)'에 영감을 주었습니다. 성씨 '로렌'은 시대를 초월하는 우아함과 고전적인 아름다움을 연상시키는데, 이는 '자두나무'를 원래 의미하며 우아한 전통과 회복력을 전달하는 한국의 흔하고 역사적으로 중요한 성씨 '이(李)'와 유사합니다.",
    "hanja_breakdown": [
      {
        "character": "李",
        "meaning": "자두나무를 참조하며, 굳건함과 고전적인 우아함을 상징하는 널리 퍼진 전통적인 한국 성씨입니다."
      },
      {
        "character": "藝",
        "meaning": "예술, 기술, 재능, 교양 — 소피아 로렌의 거장다운 예술성과 세련된 존재감을 반영합니다."
      },
      {
        "character": "智",
        "meaning": "지혜, 지성 — 원래 이름 '소피아'의 의미와 직접적으로 일치합니다."
      }
    ],
    "poetic_interpretation": "'이예지'는 깊은 통찰력과 예술적 우아함을 모두 갖춘 지혜롭고 교양 있는 정신의 이미지를 구현합니다. 이는 마치 조용하고 지적인 아름다움으로 피어나는 자두나무처럼, 심오한 내면의 힘과 결합된 고전적인 아름다움의 본질을 포착합니다."
  }
  ```

#### 다. 결과 히스토리 (선택사항 - MVP 이후 고려)

- **기능:** 현재 세션 내에서 생성된 이름들을 기록하고 목록 형태로 보여줍니다.
- **중요성:** 사용자가 여러 이름을 비교하거나 이전에 생성했던 이름을 다시 확인할 수 있도록 하여 편의성을 높입니다.
- **작동 방식:** 브라우저 세션 스토리지를 활용하여 생성된 이름 데이터를 임시 저장하고, UI에 리스트 형태로 표시합니다.

---

### 3. 사용자 경험 (User Experience)

#### 가. 사용자 페르소나

- **페르소나 1: 알렉스 (20대 후반, 미국인, K-팝 팬)**
  - **배경:** K-팝과 한국 드라마를 통해 한국 문화에 깊은 관심을 갖게 되었다. 한국인 친구들과 온라인으로 교류하며 한국어를 배우고 있다. 자신을 더 잘 나타낼 수 있는 한국식 이름을 갖고 싶어 한다.
  - **목표:** 자신의 개성과 관심사를 반영하면서도 발음하기 쉽고 의미 있는 한국 이름을 찾고 싶다.
  - **불만:** 온라인 번역기는 너무 직역투이거나 어색한 이름을 추천해 준다.
- **페르소나 2: 소피아 (30대 초반, 프랑스인, 디자이너)**
  - **배경:** 한국 전통 공예와 디자인에 매료되어 한국 방문을 계획 중이다. 한국적인 영감을 자신의 작업에 반영하고 싶어하며, 한국식 예명을 사용해보고자 한다.
  - **목표:** 자신의 예술적 감각과 어울리는 세련되고 독창적인 한국 이름을 원한다. 이름에 담긴 한자의 의미도 중요하게 생각한다.
  - **불만:** 전문가의 도움 없이 아름다운 한자 이름을 찾는 것이 어렵다.

#### 나. 주요 사용자 흐름

1.  **방문 및 이름 입력:**
    - 사용자는 메인 페이지에 접속한다.
    - 서비스에 대한 간략한 소개를 확인한다.
    - 중앙에 위치한 이름 입력창에 자신의 외국 이름을 입력한다.
    - "한국 이름 생성" 버튼을 클릭한다.
2.  **결과 확인:**
    - 잠시 후, 생성된 한국 이름과 관련 정보(한자, 로마자 표기, 의미 설명, 시적 해석 등)가 화면에 표시된다.
    - 사용자는 생성된 이름과 그 설명을 주의 깊게 읽어본다.
3.  **추가 행동 (선택적):**
    - 다른 이름을 시도하기 위해 다시 이름을 입력한다.
    - (향후 기능) 생성된 이름을 저장하거나 공유한다.

#### 다. UI/UX 고려사항

- **직관적인 디자인:** 처음 방문하는 사용자도 쉽게 이해하고 사용할 수 있도록 명확하고 간결한 UI를 제공한다.
- **미적 즐거움:** 한국적인 아름다움을 느낄 수 있는 디자인 요소를 섬세하게 사용하여 시각적 만족감을 높인다. (예: 전통 문양, 색감 등)
- **반응형 웹:** 다양한 디바이스(데스크탑, 태블릿, 모바일)에서 최적화된 화면을 제공한다.
- **명확한 피드백:** 이름 생성 중에는 로딩 상태를 명확히 표시하고, 오류 발생 시 사용자에게 친절하게 안내한다.
- **정보의 가독성:** 생성된 이름, 한자, 의미 설명 등이 명확하게 구분되고 읽기 쉽게 표시되어야 한다. Shadcn UI 컴포넌트를 활용하여 깔끔하고 정돈된 레이아웃을 구현한다.

---

### 4. 기술 아키텍처 (Technical Architecture)

#### 가. 시스템 구성 요소

- **프론트엔드:** Next.js (App Router) 기반의 웹 애플리케이션
  - 사용자 인터페이스(UI) 및 사용자 경험(UX) 로직 처리
  - API 요청 및 응답 처리
  - 상태 관리 (예: React Context 또는 Zustand 등 고려)
- **AI 모델 API:** Google Gemini API
  - 입력된 외국 이름과 시스템 프롬프트를 기반으로 한국식 이름 및 관련 정보 생성
- **백엔드 (MVP 이후):** Supabase
  - 사용자 인증, 생성된 이름 기록 저장, 즐겨찾기 등의 기능 제공

#### 나. 데이터 모델 (결과 중심)

- AI 모델이 반환할 것으로 기대되는 JSON 구조는 "핵심 기능 > 결과 출력 영역"에 명시된 바와 같습니다.
- 프론트엔드에서는 이 구조를 기반으로 상태를 관리하고 UI를 렌더링합니다.

#### 다. API 및 통합

- **Google Gemini API 연동:**
  - 프론트엔드에서 직접 API를 호출하거나, Next.js의 API Routes (또는 Server Actions)를 통해 백엔드 로직을 경유하여 호출할 수 있습니다. 보안 및 키 관리를 위해 후자를 권장합니다.
  - API 요청 시 사용자 입력 이름과 사전에 정의된 시스템 프롬프트를 함께 전달합니다.
  - API 응답(JSON)을 파싱하여 UI에 표시합니다.

#### 라. 인프라 요구사항 (MVP 기준)

- **호스팅:** Vercel 또는 Netlify 등 정적 사이트 및 Next.js 호스팅에 적합한 플랫폼 사용
- **도메인:** 서비스 이름에 맞는 도메인 등록 (예: `koreannamepoet.com`)

#### 마. AI 프롬프트 구조

- **시스템 인스트럭션 (예시):**

  ```
  You are an AI that transforms foreign names into Korean-style full names (family name + given name) in a poetic and culturally resonant way. You do not translate based on phonetics. Instead, you reinterpret the *meaning*, *imagery*, and *emotional tone* of the original name and generate a natural-sounding Korean name (2–3 syllables) with Chinese characters (Hanja).
  ```

✅ Input Handling Rules:

- If the user provides a **full name** (e.g., Isabella Rossellini), analyze both the **given name** and the **family name** separately.
  - The **given name** must inspire the **Korean given name**.
  - The **family name** must influence the choice of **Korean surname**. Do not ignore it.
- If only a **given name** is provided, choose a Korean surname that matches the tone and concept of the generated name.

✅ Output Format (JSON structured):

{
"original_name": "[Original Foreign Name]",
"korean_name": "[Hangul Name] ([Hanja Name], Romanized)",
"connection_explanation": "[Explain how the foreign given name inspired the Korean given name, and how the foreign family name influenced the Korean surname. Clarify both connections clearly.]",
"hanja_breakdown": [
{
"character": "[Hanja Character]",
"meaning": "[Symbolic meaning of the character and its relevance to the name.]"
},
...
],
"poetic_interpretation": "[A short, poetic summary of the Korean name, capturing the essence and symbolism of the original name.]"
}

✅ Style Guidelines:

- Do not phonetically transliterate.
- Always generate **natural Korean names** that real people could have (e.g., 김하린, 이서윤, 박도현).
- Select meaningful Hanja that poetically reflect the original name's imagery and values.
- Be respectful, elegant, and thoughtful in tone — names are deeply personal.

✅ Example:

{
"original_name": "Isabella Rossellini",
"korean_name": "최아련 (崔雅漣, Choi A-ryeon)",
"connection_explanation": "‘Isabella' is a classic European name meaning 'devoted to God' and is often associated with elegance and refined beauty. This inspired the Korean given name 'A-ryeon,' which expresses quiet grace and artistic depth. 'Rossellini,' an Italian surname related to 'rose' or 'red,' suggests passion and sophistication. Therefore, the Korean surname 'Choi (崔),' commonly associated with dignity and formality, was chosen to reflect that poised strength.",
"hanja_breakdown": [
{
"character": "崔",
"meaning": "A dignified and noble Korean surname, evoking tradition and respectability."
},
{
"character": "雅",
"meaning": "Refined, elegant — reflecting Isabella's graceful qualities."
},
{
"character": "漣",
"meaning": "Ripples or gentle waves — symbolizing poetic softness and lingering beauty."
}
],
"poetic_interpretation": "‘Choi A-ryeon' evokes the image of gentle ripples on a quiet lake — elegant, calm, and timeless. It captures Isabella's graceful presence and the romantic sophistication of her heritage."
}

```

- **사용자 입력:** `[사용자 입력 이름]`
- **최종 프롬프트 (예시):**
```

You are an AI that transforms foreign names into Korean-style full names... (상기 시스템 인스트럭션 전체)
[User Input: "Isabella Rossellini"]

```
- AI는 이 프롬프트를 기반으로 지정된 JSON 구조에 맞는 결과를 반환해야 합니다.

---

### 5. 개발 로드맵 (Development Roadmap)

#### 가. MVP (Minimum Viable Product) 요구사항

1.  **이름 입력 UI 구현:**
  - 단일 텍스트 입력 필드
  - "한국 이름 생성" 버튼
2.  **Gemini API 연동:**
  - 사용자 입력과 시스템 프롬프트를 조합하여 API 요청 전송
  - API 응답(JSON) 수신 및 파싱
3.  **결과 출력 UI 구현:**
  - `original_name`, `korean_name` (한글, 한자, 로마자), `connection_explanation`, `hanja_breakdown` (각 한자의 의미), `poetic_interpretation`을 포함하는 결과 표시
  - Shadcn UI 컴포넌트를 활용하여 깔끔하고 가독성 높은 디자인 적용
4.  **기본 레이아웃 및 스타일링:**
  - 헤더 (서비스 제목)
  - 반응형 디자인 (모바일 우선 접근 또는 데스크탑과 동시 고려)
  - Tailwind CSS를 사용한 스타일링
5.  **테스트 및 배포 준비:**
  - 몇 가지 테스트용 이름으로 기능 검증 (예: "Isabella Rossellini", "Leonardo da Vinci", "Sophia Loren")
  - Vercel 또는 Netlify를 통한 배포

#### 나. 향후 기능 (MVP 이후 고려)

- **사용자 인증 및 데이터베이스 연동 (Supabase 활용):**
- 사용자 계정 생성 및 로그인 기능
- 생성된 이름 및 설정을 사용자 계정에 저장
- **즐겨찾기 기능:** 사용자가 마음에 드는 생성 이름을 저장하고 언제든 다시 볼 수 있도록 하는 기능
- **이름 인증서 이미지 생성/공유:** 생성된 이름을 예쁜 디자인의 '이름 인증서' 이미지로 만들어 저장하거나 소셜 미디어에 공유할 수 있는 기능
- **생성 기록 고급 검색/필터링:** 저장된 이름들을 조건에 따라 검색하거나 필터링하는 기능
- **다국어 지원:** 한국어 외 영어 등 다른 언어로 UI를 제공하는 기능
- **다양한 이름 생성 옵션:** 사용자가 선호하는 스타일(예: 전통적, 현대적, 특정 의미 강조 등)을 선택할 수 있는 옵션 제공
- **성씨 선택 기능:** 사용자가 선호하는 한국 성씨를 선택하거나, AI가 추천하는 성씨 외 다른 성씨를 탐색할 수 있는 기능

#### 다. 완료 기준 (Acceptance Criteria for MVP)

- [ ] 외국 이름을 입력하고 "생성" 버튼을 누르면, AI 모델로부터 응답을 받아 구조화된 결과를 화면에 보여준다.
- [ ] 결과에는 생성된 한국식 이름(한글, 한자, 로마자 표기), 원래 이름과의 연관성 설명, 각 한자의 의미, 시적인 해석 문구가 반드시 포함된다.
- [ ] 결과는 Shadcn UI 컴포넌트를 사용하여 시각적으로 깔끔하고 명확하게 출력된다.
- [ ] 웹 애플리케이션은 모바일 및 데스크탑 환경에서 적절히 반응하여 표시된다 (반응형 웹).
- [ ] Google Gemini API와 성공적으로 연동되어 실제 이름 생성 로직이 동작하거나, 이것이 MVP 단계에서 어려울 경우 목업(mock-up) 데이터를 사용하여 전체 흐름을 확인할 수 있다.
- [ ] AI 응답의 JSON 구조가 유효한지 검사하고, 응답이 누락되거나 비정상적인 경우 사용자에게 적절한 메시지를 보여주며 오류를 우아하게 처리한다 (graceful error handling).

---

### 6. 논리적 의존성 체인 (Logical Dependency Chain)

MVP 개발을 위한 논리적 순서는 다음과 같습니다.

1.  **기본 프로젝트 설정 (Foundation):**
  - Next.js 프로젝트 생성 및 기본 환경 설정 (ESLint, Prettier 등).
  - Shadcn UI 및 Tailwind CSS 설정.
  - 기본 페이지 레이아웃 (헤더, 푸터 등) 구성.
2.  **핵심 UI 요소 구현 (Visible Frontend):**
  - 이름 입력 컴포넌트 (입력창, 버튼) 구현.
  - 결과 표시 영역 컴포넌트의 기본 구조 구현 (데이터 없이).
3.  **AI 연동 또는 목업 데이터 준비 (Core Logic):**
  - Gemini API 호출 로직 구현 (API 키 관리 포함) 또는,
  - MVP 테스트를 위한 목업 JSON 데이터 구조 정의 및 샘플 데이터 생성.
4.  **데이터 바인딩 및 결과 표시 (Connecting Frontend to Logic):**
  - API 응답 또는 목업 데이터를 결과 표시 컴포넌트에 바인딩하여 실제 데이터가 보이도록 구현.
  - 한자, 의미, 설명 등 모든 정보가 정확히 표시되는지 확인.
5.  **스타일링 및 반응형 디자인 (Refinement):**
  - 전체 UI에 대한 세부 스타일링 적용.
  - 다양한 화면 크기(모바일, 태블릿, 데스크탑)에서의 반응형 동작 확인 및 수정.
6.  **테스트 및 오류 처리 (Quality Assurance):**
  - 다양한 입력값으로 테스트 (정상, 비정상, 경계값).
  - API 오류, 데이터 파싱 오류 등 예외 상황에 대한 처리 구현.
7.  **배포 (Deployment):**
  - Vercel/Netlify 등 플랫폼에 배포.

**주요 원칙:**

- **가시적인 결과 우선:** 사용자가 빠르게 인터랙션하고 결과를 볼 수 있는 프론트엔드 부분을 먼저 개발합니다.
- **점진적 확장:** 핵심 기능을 먼저 구현하고, 이후 고도화 기능(결과 히스토리, 사용자 인증 등)을 추가합니다.
- **API 연동 분리:** API 연동 부분은 초기에 목업 데이터로 대체하여 프론트엔드 개발과 병행하거나 선행할 수 있도록 합니다.

---

### 7. 위험 요소 및 완화 방안 (Risks and Mitigations)

#### 가. 기술적 도전 과제

- **AI 모델의 일관성 및 품질:**
- **위험:** Gemini API가 항상 기대하는 품질과 형식의 한국 이름을 생성하지 않을 수 있습니다. (예: 어색한 이름, 부적절한 한자 선택, JSON 형식 오류)
- **완화 방안:**
  - **정교한 프롬프트 엔지니어링:** 지속적인 테스트와 개선을 통해 최적의 시스템 프롬프트를 개발합니다. 다양한 예시와 명확한 지침을 프롬프트에 포함합니다.
  - **결과 후처리:** 필요한 경우 API 응답을 프론트엔드 또는 간단한 백엔드 로직에서 검증하고 일부 수정하는 로직을 추가할 수 있습니다. (예: JSON 형식 검사, 부적절한 단어 필터링 - MVP에서는 최소화)
  - **재시도 옵션:** 사용자에게 "다른 이름 추천받기" 같은 옵션을 제공하여 만족스럽지 않은 결과에 대한 대안을 제시합니다.
- **한자 및 문화적 정확성:**
- **위험:** AI가 추천하는 한자나 이름의 문화적 맥락이 부적절하거나 어색할 수 있습니다.
- **완화 방안:**
  - **제한적인 한자 풀 사용 고려 (MVP 이후):** 긍정적이고 일반적으로 사용되는 한자 목록을 내부적으로 갖추고, AI가 이를 참고하도록 유도할 수 있습니다.
  - **사용자 피드백 루프 (MVP 이후):** 사용자들이 생성된 이름에 대해 피드백을 줄 수 있는 기능을 고려합니다.
  - **전문가 검토 (초기):** 가능하다면 한국어 및 작명에 지식이 있는 사람에게 초기 결과물들을 검토받습니다.

#### 나. MVP 범위 설정

- **위험:** MVP 단계에서 너무 많은 기능을 포함하려 하거나, 각 기능의 완성도를 지나치게 높이려다 개발 기간이 늘어질 수 있습니다.
- **완화 방안:**
- **핵심 가치 집중:** "외국 이름을 의미있는 한국 이름으로 바꿔준다"는 핵심 가치에 집중하고, 부가 기능은 과감히 MVP 이후로 넘깁니다.
- **"완료 기준" 명확화:** PRD의 "완료 기준"을 엄격히 따르고, 해당 기준을 만족하면 MVP로 인정합니다.

#### 다. 리소스 제약

- **위험:** 1인 개발 또는 소규모 팀으로 진행될 경우, 특정 기술 스택에 대한 경험 부족, 시간 부족 등의 문제가 발생할 수 있습니다.
- **완화 방안:**
- **익숙한 기술 우선 사용:** Next.js, Shadcn UI, Tailwind CSS 등 비교적 최신이면서도 커뮤니티 지원이 활발하고 개발 생산성이 높은 기술을 선택했습니다.
- **MVP 단순화:** 문제 발생 시, 핵심 기능에 영향을 주지 않는 선에서 일부 UI/UX 디테일이나 애니메이션 등을 단순화하여 개발 속도를 확보합니다.
- **오픈소스 및 커뮤니티 활용:** 개발 중 발생하는 문제는 적극적으로 관련 커뮤니티나 문서를 참고하여 해결합니다.

#### 라. 테스트 참고 사항

- **테스트용 이름 예시:**
- `"Isabella Rossellini"`
- `"Leonardo da Vinci"`
- `"Sophia Loren"`
- `"John Smith"` (매우 일반적인 이름)
- `"Alexandr"` (다양한 문화권에서 사용될 수 있는 이름)
- 단일 이름 (예: `"Aurora"`)
- **AI 응답의 JSON 구조 유효성 검사:** 응답이 예상된 JSON 스키마를 따르는지 확인해야 합니다.
- **오류 처리 테스트:**
- API 호출 실패 시 (네트워크 오류, API 키 오류 등)
- API가 비정상적인 응답을 반환했을 때 (빈 값, 예상치 못한 형식 등)
- graceful하게 오류 메시지를 사용자에게 표시하는지 확인합니다.

---

### 8. 부록 (Appendix)

#### 가. 참고 자료

- [Gemini API 문서 링크 (가상)](https://ai.google.dev/docs/gemini_api_overview)
- [Shadcn UI 문서 링크](https://ui.shadcn.com/)
- [Next.js 문서 링크](https://nextjs.org/docs)
- [Tailwind CSS 문서 링크](https://tailwindcss.com/docs)

#### 나. 용어 정의

- **PRD (Product Requirements Document):** 제품 요구사항 문서. 제품이 무엇인지, 왜 만드는지, 어떻게 만들 것인지 등을 정의하는 문서.
- **MVP (Minimum Viable Product):** 최소 기능 제품. 핵심 기능만 구현하여 시장의 반응을 빠르게 확인하고 개선해나가기 위한 제품.
- **Hanja (한자):** 한국어에서 사용되는 중국 문자. 이름에 깊은 의미를 부여하는 데 사용됨.
- **Romanization (로마자 표기):** 한국어를 로마 알파벳으로 표기하는 방식.

#### 다. 미결정 사항 (Open Questions)

- 최종 서비스명 확정
- 초기 목표 사용자층을 위한 마케팅 전략
- 법적 검토 사항 (개인정보보호 등 - Supabase 도입 시)

---

초기 컴포넌트 구조나 디렉토리 설계가 필요하시면 도와드릴까요?
```
