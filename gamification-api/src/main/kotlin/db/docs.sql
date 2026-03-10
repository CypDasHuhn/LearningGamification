START TRANSACTION;

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `Question_Theme`;
DROP TABLE IF EXISTS `gap_option`;
DROP TABLE IF EXISTS `gap_field`;
DROP TABLE IF EXISTS `mc_answer`;
DROP TABLE IF EXISTS `question`;
DROP TABLE IF EXISTS `question_set`;
DROP TABLE IF EXISTS `theme`;
DROP TABLE IF EXISTS `team`; 

SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE `team` (
  `team_id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`team_id`)
) ENGINE=InnoDB;

CREATE TABLE `theme` (
  `theme_id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT NULL,
  PRIMARY KEY (`theme_id`)
) ENGINE=InnoDB;

CREATE TABLE `question_set` (
  `question_set_id` INT NOT NULL AUTO_INCREMENT,
  `team_id` INT NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`question_set_id`),
  KEY `idx_question_set_team_id` (`team_id`),
  CONSTRAINT `fk_question_set_team`
    FOREIGN KEY (`team_id`) REFERENCES `team`(`team_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE `question` (
  `question_id` INT NOT NULL AUTO_INCREMENT,
  `question_set_id` INT NOT NULL,
  `question_type` ENUM('MC','TF','GAP') NOT NULL,
  `start_text` TEXT NULL,
  `image_url` TEXT NULL,
  `end_text` TEXT NULL,
  `allows_multiple` TINYINT(1) NOT NULL DEFAULT 0,
  `points` INT NOT NULL DEFAULT 1,
  PRIMARY KEY (`question_id`),
  KEY `idx_question_question_set` (`question_set_id`),
  KEY `idx_question_type` (`question_type`),
  CONSTRAINT `fk_question_question_set`
    FOREIGN KEY (`question_set_id`) REFERENCES `question_set`(`question_set_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE `Question_Theme` (
  `question_id` INT NOT NULL,
  `theme_id` INT NOT NULL,
  PRIMARY KEY (`question_id`, `theme_id`),
  KEY `idx_question_theme_theme` (`theme_id`),
  CONSTRAINT `fk_qt_question`
    FOREIGN KEY (`question_id`) REFERENCES `question`(`question_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_qt_theme`
    FOREIGN KEY (`theme_id`) REFERENCES `theme`(`theme_id`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE `mc_answer` (
  `answer_id` INT NOT NULL AUTO_INCREMENT,
  `question_id` INT NOT NULL,
  `option_text` TEXT NOT NULL,
  `is_correct` TINYINT(1) NOT NULL DEFAULT 0,
  `option_order` INT NOT NULL,
  PRIMARY KEY (`answer_id`),
  UNIQUE KEY `uq_mc_answer_question_order` (`question_id`, `option_order`),
  KEY `idx_mc_answer_question` (`question_id`),
  CONSTRAINT `fk_mc_answer_question`
    FOREIGN KEY (`question_id`) REFERENCES `question`(`question_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE `gap_field` (
  `gap_id` INT NOT NULL AUTO_INCREMENT,
  `question_id` INT NOT NULL,
  `gap_index` INT NOT NULL,
  `text_before` TEXT NULL,
  `text_after` TEXT NULL,
  PRIMARY KEY (`gap_id`),
  UNIQUE KEY `uq_gap_field_question_index` (`question_id`, `gap_index`),
  KEY `idx_gap_field_question` (`question_id`),
  CONSTRAINT `fk_gap_field_question`
    FOREIGN KEY (`question_id`) REFERENCES `question`(`question_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE `gap_option` (
  `gap_option_id` INT NOT NULL AUTO_INCREMENT,
  `gap_id` INT NOT NULL,
  `option_text` TEXT NOT NULL,
  `is_correct` TINYINT(1) NOT NULL DEFAULT 0,
  `option_order` INT NOT NULL,
  PRIMARY KEY (`gap_option_id`),
  UNIQUE KEY `uq_gap_option_gap_order` (`gap_id`, `option_order`),
  KEY `idx_gap_option_gap` (`gap_id`),
  CONSTRAINT `fk_gap_option_gap`
    FOREIGN KEY (`gap_id`) REFERENCES `gap_field`(`gap_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB;

COMMIT;
