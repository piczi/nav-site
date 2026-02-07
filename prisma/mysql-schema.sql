-- 创建数据库（如果还没有）
-- CREATE DATABASE IF NOT EXISTS your_database_name CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 使用数据库
-- USE your_database_name;

-- Category 表
CREATE TABLE IF NOT EXISTS Category (
  id VARCHAR(191) NOT NULL,
  name VARCHAR(191) NOT NULL,
  slug VARCHAR(191) NOT NULL,
  icon VARCHAR(191) NULL,
  color VARCHAR(191) NULL,
  description TEXT NULL,
  sort INT NOT NULL DEFAULT 0,
  isShow TINYINT NOT NULL DEFAULT 1,
  createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updatedAt DATETIME(3) NOT NULL,

  PRIMARY KEY (id),
  UNIQUE INDEX slug_unique (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Website 表
CREATE TABLE IF NOT EXISTS Website (
  id VARCHAR(191) NOT NULL,
  title VARCHAR(191) NOT NULL,
  url TEXT NOT NULL,
  description TEXT NULL,
  icon VARCHAR(191) NULL,
  categoryId VARCHAR(191) NOT NULL,
  isShow TINYINT NOT NULL DEFAULT 1,
  isFeatured TINYINT NOT NULL DEFAULT 0,
  sort INT NOT NULL DEFAULT 0,
  clickCount INT NOT NULL DEFAULT 0,
  tags TEXT NULL,
  createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updatedAt DATETIME(3) NOT NULL,

  PRIMARY KEY (id),
  INDEX categoryId_index (categoryId),
  INDEX isShow_index (isShow),
  INDEX isFeatured_index (isFeatured),
  INDEX clickCount_index (clickCount),
  FOREIGN KEY (categoryId) REFERENCES Category(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Click 表
CREATE TABLE IF NOT EXISTS Click (
  id VARCHAR(191) NOT NULL,
  websiteId VARCHAR(191) NOT NULL,
  ip VARCHAR(191) NULL,
  userAgent TEXT NULL,
  referrer TEXT NULL,
  createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  PRIMARY KEY (id),
  INDEX websiteId_index (websiteId),
  INDEX createdAt_index (createdAt),
  FOREIGN KEY (websiteId) REFERENCES Website(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Admin 表
CREATE TABLE IF NOT EXISTS Admin (
  id VARCHAR(191) NOT NULL,
  username VARCHAR(191) NOT NULL,
  password VARCHAR(191) NOT NULL,
  createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updatedAt DATETIME(3) NOT NULL,

  PRIMARY KEY (id),
  UNIQUE INDEX username_unique (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
