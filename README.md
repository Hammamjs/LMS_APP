<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>

# Learning Management System (LMS) - System Description

## Overview

A Learning Management System (LMS) is a software platform designed to manage, deliver, and track educational content and training programs. It enables organizations, instructors, and learners to interact in a structured digital learning environment.

The system supports the creation of courses, enrollment of users, delivery of learning materials, assessments, and progress tracking.

---

## Objectives

- Provide a centralized platform for learning and training
- Enable instructors to create and manage courses
- Allow students to access learning content anytime
- Track learner progress and performance
- Support assessments, quizzes, and certifications

---

## Key Users

1. **Admin**
   - Manages system settings and users
   - Controls roles and permissions

2. **Instructor**
   - Creates and manages courses
   - Uploads content (videos, documents, quizzes)
   - Evaluates student performance

3. **Student**
   - Enrolls in courses
   - Consumes learning content
   - Completes quizzes and assignments
   - Tracks progress

---

## Core Modules

- **User Management**
  - Registration, authentication, roles

- **Course Management**
  - Create, update, publish courses
  - Organize into sections/lessons

- **Lessons**
  - Videos

- **Enrollment System**
  - Students enroll in courses

- **Progress Tracking**
  - Completion status, scores

- **Notification System**
  - Alerts for deadlines, updates

---

## System Scope

The LMS will:

- Support web-based access (initially)
- Handle multiple user roles
- Store and manage structured course data
- Provide APIs for frontend/mobile integration

---

## Out of Scope (for now)

- Live video streaming (optional future)
- AI-based recommendations
- Advanced analytics dashboards

---

## High-Level Entities (based on ERD)

- Users
- Courses
- Lessons
- Enrollments
- Progress

---

## Success Criteria

- Users can enroll and complete courses
- Instructors can manage content efficiently
- System handles multiple concurrent users reliably
- Clear tracking of learner progress and results

---

# LMS Features Specification

## 1. Authentication & User Management

### Features

- User registration (Student / Instructor)
- Login & logout
- Role-based access control (Admin, Instructor, Student)
- Profile management (update name, email, password)
- Password reset

### Rules

- Email must be unique
- Role determines accessible features

---

## 2. Course Management

### Features

- Create course (Instructor)
- Edit / delete course
- Publish / unpublish course
- Add course metadata (title, description, category)
- Upload course thumbnail

### Rules

- Only instructors can create courses
- Only published courses are visible to students

---

## 3. Lesson & Content Management

### Features

- Add lessons to a course
- Reorder lessons
- Upload content:
  - Video
  - PDF / documents
  - Text content

- Mark lesson as preview (free access)

### Rules

- A course must have at least one lesson to be published

---

## 4. Enrollment System

### Features

- Student enroll in course
- View enrolled courses
- Drop course (optional)
- Admin enroll users manually

### Rules

- A student cannot enroll twice in the same course
- Enrollment required to access full content

---

## 5. Learning Experience

### Features

- View course content
- Navigate lessons (next/previous)
- Mark lesson as completed
- Resume last viewed lesson

### Rules

- Only enrolled students can access lessons (except previews)

---

## 6. Assessment & Quiz System

### Features

- Create quizzes (Instructor)
- Add questions (MCQ, true/false, etc.)
- Submit quiz (Student)
- Auto grading
- View results

### Rules

- Each submission is linked to a student and course
- Score calculated automatically

---

## 7. Progress Tracking

### Features

- Track completed lessons
- Show course progress (%)
- View quiz scores
- Completion status (in-progress / completed)

### Rules

- Progress updates when lessons are marked complete
- Course is completed when all required items are done

---

## 8. Notifications

### Features

- Notify on course enrollment
- Notify on new content
- Notify on quiz deadlines
- Email or in-app notifications

---

## 9. Admin Panel

### Features

- Manage users (activate, deactivate)
- Manage courses
- View system activity
- Assign roles

---

## 10. Search & Discovery

### Features

- Search courses by title
- Filter by category
- View popular/latest courses

---

## 11. (Optional - Future Enhancements)

### Features

- Course reviews & ratings
- Certificates of completion
- Live classes
- Discussion forums
- AI recommendations

---

# LMS API Design Specification

## Base URL

/api/v1

---

# 1. Authentication

## Register

POST /auth/register

Request:
{
"name": "string",
"email": "string",
"password": "string",
"role": "student | instructor"
}

Response:
{
"id": "uuid",
"token": "jwt"
}

---

## Login

POST /auth/login

Request:
{
"email": "string",
"password": "string"
}

Response:
{
"token": "jwt"
}

---

# 2. Users

## Get Profile

GET /users/me

## Update Profile

PUT /users/me

---

# 3. Courses

## Create Course (Instructor)

POST /courses

Request:
{
"title": "string",
"description": "string",
"category": "string"
}

---

## Get All Courses

GET /courses

Query:

- search
- category
- page

---

## Get Course Details

GET /courses/{courseId}

---

## Update Course

PUT /courses/{courseId}

---

## Publish Course

PATCH /courses/{courseId}/publish

---

# 4. Lessons

## Add Lesson

POST /courses/{courseId}/lessons

Request:
{
"title": "string",
"contentType": "video | pdf | text",
"contentUrl": "string"
}

---

## Get Lessons

GET /courses/{courseId}/lessons

---

## Mark Lesson Complete

POST /lessons/{lessonId}/complete

---

# 5. Enrollment

## Enroll in Course

POST /enrollments

Request:
{
"courseId": "uuid"
}

---

## Get My Courses

GET /enrollments/me

---

# 6. Quizzes

## Create Quiz

POST /courses/{courseId}/quizzes

---

## Add Question

POST /quizzes/{quizId}/questions

Request:
{
"question": "string",
"type": "mcq",
"options": [],
"correctAnswer": "string"
}

---

## Get Quiz

GET /quizzes/{quizId}

---

## Submit Quiz

POST /quizzes/{quizId}/submit

Request:
{
"answers": [
{
"questionId": "uuid",
"answer": "string"
}
]
}

Response:
{
"score": 80,
"passed": true
}

---

# 7. Progress

## Get Course Progress

GET /courses/{courseId}/progress

Response:
{
"completedLessons": 5,
"totalLessons": 10,
"percentage": 50
}

---

# 8. Notifications

## Get Notifications

GET /notifications

---

# 9. Admin

## Get All Users

GET /admin/users

## Update User Role

PATCH /admin/users/{userId}/role

---
