// form 요소 가져오기
const form = document.getElementById('userForm');

// form submit 이벤트 처리
form.addEventListener('submit', async (e) => {
    e.preventDefault(); // 기본 form 제출 동작 막기

    // FormData로 form 데이터 수집
    const formData = new FormData(form);

    // FormData를 JSON 객체로 변환
    const userData = {
        name: formData.get('name'),
        user_id: formData.get('user_id'),
        password: formData.get('password'),
        phone_number: formData.get('phone_number'),
        email: formData.get('email'),
        school_email: formData.get('school_email')
    };

    try {
        // POST 요청 보내기
        const response = await fetch('http://localhost:8080/api/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData)
        });

        // 응답 처리
        if (response.ok) {
            const data = await response.json();
            document.getElementById('result').innerHTML =
                `<p style="color: green;">등록 성공! ID: ${data.id}</p>`;
            form.reset(); // form 초기화
        } else {
            document.getElementById('result').innerHTML =
                `<p style="color: red;">등록 실패: ${response.status}</p>`;
        }
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('result').innerHTML =
            `<p style="color: red;">오류 발생: ${error.message}</p>`;
    }
});
