-- 1. 데이터베이스 생성 (원하는 이름으로 수정 가능)
CREATE DATABASE IF NOT EXISTS campustrip
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

-- 2. 생성한 데이터베이스 선택
USE campustrip;

-- 3. 이어서 테이블 생성 스크립트 실행
-- (앞서 작성해드린 CREATE TABLE 구문들을 여기에 붙여넣고 실행)

-- 회원 테이블
CREATE TABLE User (
    membership_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(255) NOT NULL,
    email VARCHAR(255) DEFAULT NULL COMMENT '앞뒤 trimming 및 *@* 방식으로 검증',
    school_email VARCHAR(255) NOT NULL COMMENT '앞뒤 trimming 및 *@* 방식으로 검증',
    mbti VARCHAR(255) DEFAULT NULL,
    preference INT DEFAULT NULL COMMENT '바이너리 정보',
    user_score FLOAT NOT NULL DEFAULT 36.5,
    role INT NOT NULL DEFAULT 1
) ENGINE=InnoDB;

-- 채팅방 테이블
CREATE TABLE Chat (
    chat_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    created_at DATETIME NOT NULL,
    title VARCHAR(255) NOT NULL
) ENGINE=InnoDB;

-- 일정/플래너 테이블
CREATE TABLE Planner (
    planner_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    membership_id INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    FOREIGN KEY (membership_id) REFERENCES User(membership_id)
) ENGINE=InnoDB;

-- 게시글 테이블
CREATE TABLE Post (
    post_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    membership_id INT NOT NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    title VARCHAR(255) NOT NULL,
    body VARCHAR(255) NOT NULL,
    team_size INT DEFAULT NULL,
    chat_id INT NOT NULL,
    planner_id INT NOT NULL,
    FOREIGN KEY (membership_id) REFERENCES User(membership_id),
    FOREIGN KEY (chat_id) REFERENCES Chat(chat_id),
    FOREIGN KEY (planner_id) REFERENCES Planner(planner_id)
) ENGINE=InnoDB;

-- 지역 테이블
CREATE TABLE Region (
    region_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    region_name VARCHAR(255) NOT NULL
) ENGINE=InnoDB;

-- 게시글-지역 매핑 테이블
CREATE TABLE PostRegion (
    post_id INT NOT NULL,
    region_id INT NOT NULL,
    PRIMARY KEY (post_id, region_id),
    FOREIGN KEY (post_id) REFERENCES Post(post_id),
    FOREIGN KEY (region_id) REFERENCES Region(region_id)
) ENGINE=InnoDB;

-- 댓글 테이블
CREATE TABLE Comment (
    comment_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    body VARCHAR(255) NOT NULL,
    membership_id INT NOT NULL,
    post_id INT NOT NULL,
    FOREIGN KEY (membership_id) REFERENCES User(membership_id),
    FOREIGN KEY (post_id) REFERENCES Post(post_id)
) ENGINE=InnoDB;

-- 알림 테이블
CREATE TABLE Alarm (
    alarm_id INT NOT NULL AUTO_INCREMENT,
    membership_id INT NOT NULL,
    link VARCHAR(255) DEFAULT NULL,
    comment VARCHAR(255) DEFAULT NULL,
    PRIMARY KEY (alarm_id, membership_id),
    FOREIGN KEY (membership_id) REFERENCES User(membership_id)
) ENGINE=InnoDB;

-- 채팅 참여자 테이블
CREATE TABLE ChatMember (
    chat_id INT NOT NULL,
    membership_id INT NOT NULL,
    is_owner TINYINT NOT NULL DEFAULT 0 COMMENT '1이면 방장, 0이면 참가자',
    PRIMARY KEY (chat_id, membership_id),
    FOREIGN KEY (chat_id) REFERENCES Chat(chat_id),
    FOREIGN KEY (membership_id) REFERENCES User(membership_id)
) ENGINE=InnoDB;

-- 채팅 메시지 테이블
--    CREATE TABLE ChatMessage (
--        message_key VARCHAR(255) NOT NULL PRIMARY KEY,
--        chat_id INT NOT NULL,
--        membership_id INT NOT NULL,
--        message VARCHAR(255) NOT NULL,
--        FOREIGN KEY (chat_id) REFERENCES Chat(chat_id),
--        FOREIGN KEY (membership_id) REFERENCES User(membership_id)
--    ) ENGINE=InnoDB;

-- 플랜 상세 일정 테이블
CREATE TABLE PlannerDetail (
    planner_order INT NOT NULL,
    planner_id INT NOT NULL,
    day INT NOT NULL,
    google_place_id VARCHAR(255) NOT NULL,
    PRIMARY KEY (planner_order, planner_id),
    FOREIGN KEY (planner_id) REFERENCES Planner(planner_id)
) ENGINE=InnoDB;

-- 게시글 첨부파일 테이블
CREATE TABLE PostAsset (
    asset_id INT NOT NULL AUTO_INCREMENT,
    post_id INT NOT NULL,
    storage_url VARCHAR(255) NOT NULL,
    file_size INT NOT NULL DEFAULT 0 COMMENT 'KB 단위',
    PRIMARY KEY (asset_id, post_id),
    FOREIGN KEY (post_id) REFERENCES Post(post_id)
) ENGINE=InnoDB;

-- 팔로우 테이블
CREATE TABLE Follow (
    follow_id INT NOT NULL AUTO_INCREMENT,
    membership_id INT NOT NULL,
    target_id INT NOT NULL COMMENT '팔로우 대상',
    PRIMARY KEY (follow_id, membership_id),
    FOREIGN KEY (membership_id) REFERENCES User(membership_id),
    FOREIGN KEY (target_id) REFERENCES User(membership_id)
) ENGINE=InnoDB;

-- 차단 테이블
CREATE TABLE Block (
    block_id INT NOT NULL AUTO_INCREMENT,
    membership_id INT NOT NULL,
    target_id INT NOT NULL COMMENT '차단 대상',
    PRIMARY KEY (block_id, membership_id),
    FOREIGN KEY (membership_id) REFERENCES User(membership_id),
    FOREIGN KEY (target_id) REFERENCES User(membership_id)
) ENGINE=InnoDB;

-- 스코어 테이블 (회원 평가)
CREATE TABLE Score (
    score_id INT NOT NULL AUTO_INCREMENT,
    membership_id INT NOT NULL,
    target_id INT NOT NULL COMMENT '평가 대상',
    score INT NOT NULL,
    PRIMARY KEY (score_id, membership_id),
    FOREIGN KEY (membership_id) REFERENCES User(membership_id),
    FOREIGN KEY (target_id) REFERENCES User(membership_id)
) ENGINE=InnoDB;

-- 위치 공유 테이블
CREATE TABLE Location (
    location_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    latitude DOUBLE NOT NULL,
    longitude DOUBLE NOT NULL,
    timestamp DATETIME NOT NULL,
    chat_id INT NOT NULL,
    membership_id INT NOT NULL,
    FOREIGN KEY (chat_id) REFERENCES Chat(chat_id),
    FOREIGN KEY (membership_id) REFERENCES User(membership_id)
) ENGINE=InnoDB;

-- 모집 지원 테이블
CREATE TABLE Application (
    application_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL,
    membership_id INT NOT NULL,
    application_date DATE NOT NULL,
    state TINYINT NOT NULL DEFAULT 0 COMMENT '1이면 승인',
    FOREIGN KEY (post_id) REFERENCES Post(post_id),
    FOREIGN KEY (membership_id) REFERENCES User(membership_id)
) ENGINE=InnoDB;
