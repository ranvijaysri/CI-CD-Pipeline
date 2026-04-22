// ─── DATABASE (localStorage) ───────────────────────────────────────────────

const DB = {
  get: (key) => JSON.parse(localStorage.getItem(key) || '[]'),
  set: (key, val) => localStorage.setItem(key, JSON.stringify(val)),
  getObj: (key) => JSON.parse(localStorage.getItem(key) || 'null'),
  setObj: (key, val) => localStorage.setItem(key, JSON.stringify(val)),
};

// Seed default admin + sample data
function seedData() {
  if (localStorage.getItem('seeded')) return;

  DB.set('users', [
    { id: 1, name: 'Admin User', username: 'admin', password: 'admin123', email: 'admin@lms.com', role: 'admin' },
    { id: 2, name: 'John Doe', username: 'john', password: 'john123', email: 'john@lms.com', role: 'student' },
    { id: 3, name: 'Jane Smith', username: 'jane', password: 'jane123', email: 'jane@lms.com', role: 'student' },
  ]);

  DB.set('courses', [
    { id: 1, title: 'Python Programming', instructor: 'Dr. Smith', description: 'Learn Python from scratch to advanced level.', duration: 40, category: 'Programming' },
    { id: 2, title: 'Web Design Basics', instructor: 'Prof. Lee', description: 'HTML, CSS and responsive design fundamentals.', duration: 30, category: 'Design' },
    { id: 3, title: 'Data Science 101', instructor: 'Dr. Patel', description: 'Introduction to data analysis and visualization.', duration: 50, category: 'Science' },
    { id: 4, title: 'Business Communication', instructor: 'Ms. Brown', description: 'Effective communication skills for business.', duration: 20, category: 'Business' },
  ]);

  DB.set('enrollments', [
    { userId: 2, courseId: 1 },
    { userId: 2, courseId: 3 },
    { userId: 3, courseId: 2 },
  ]);

  DB.set('grades', [
    { id: 1, userId: 2, courseId: 1, marks: 88 },
    { id: 2, userId: 3, courseId: 2, marks: 74 },
  ]);

  DB.set('announcements', [
    { id: 1, title: 'Welcome to LMS!', content: 'We are excited to launch our new Learning Management System. Explore courses and start learning today!', author: 'Admin', date: '2024-01-01' },
    { id: 2, title: 'New Courses Added', content: 'Check out our latest courses in Data Science and Business Communication.', author: 'Admin', date: '2024-01-05' },
  ]);

  localStorage.setItem('seeded', '1');
}

// ─── AUTH ───────────────────────────────────────────────────────────────────

let currentUser = null;

function login() {
  const username = document.getElementById('loginUsername').value.trim();
  const password = document.getElementById('loginPassword').value.trim();
  const role = document.getElementById('loginRole').value;
  const msg = document.getElementById('loginMsg');

  const users = DB.get('users');
  const user = users.find(u => u.username === username && u.password === password && u.role === role);

  if (!user) { msg.textContent = 'Invalid credentials.'; msg.className = 'msg error'; return; }

  currentUser = user;
  DB.setObj('currentUser', user);
  msg.textContent = '';
  initDashboard();
}

function register() {
  const name = document.getElementById('regName').value.trim();
  const username = document.getElementById('regUsername').value.trim();
  const password = document.getElementById('regPassword').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const role = document.getElementById('regRole').value;
  const msg = document.getElementById('registerMsg');

  if (!name || !username || !password || !email) { msg.textContent = 'All fields required.'; msg.className = 'msg error'; return; }

  const users = DB.get('users');
  if (users.find(u => u.username === username)) { msg.textContent = 'Username already exists.'; msg.className = 'msg error'; return; }

  const newUser = { id: Date.now(), name, username, password, email, role };
  users.push(newUser);
  DB.set('users', users);

  msg.textContent = 'Registered! Please login.'; msg.className = 'msg success';
}

function logout() {
  currentUser = null;
  localStorage.removeItem('currentUser');
  document.getElementById('dashboardSection').style.display = 'none';
  document.getElementById('authSection').style.display = 'flex';
}

// ─── DASHBOARD INIT ─────────────────────────────────────────────────────────

function initDashboard() {
  document.getElementById('authSection').style.display = 'none';
  document.getElementById('dashboardSection').style.display = 'flex';
  document.getElementById('sidebarUser').textContent = currentUser.name;
  document.getElementById('sidebarRole').textContent = currentUser.role;

  const isAdmin = currentUser.role === 'admin';
  document.getElementById('studentsNav').style.display = isAdmin ? 'block' : 'none';
  document.getElementById('myCoursesNav').style.display = isAdmin ? 'none' : 'block';
  document.getElementById('addCourseBtn').style.display = isAdmin ? 'inline-block' : 'none';
  document.getElementById('addGradeBtn').style.display = isAdmin ? 'inline-block' : 'none';
  document.getElementById('addAnnouncementBtn').style.display = isAdmin ? 'inline-block' : 'none';
  document.getElementById('gradeActionHead').style.display = isAdmin ? '' : 'none';

  showPage('dashboard');
}

// ─── NAVIGATION ─────────────────────────────────────────────────────────────

function showPage(page) {
  document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  document.getElementById('page-' + page).style.display = 'block';

  const renders = { dashboard: renderDashboard, courses: renderCourses, students: renderStudents, myCourses: renderMyCourses, grades: renderGrades, announcements: renderAnnouncements };
  if (renders[page]) renders[page]();
}

// ─── DASHBOARD ──────────────────────────────────────────────────────────────

function renderDashboard() {
  const courses = DB.get('courses');
  const users = DB.get('users');
  const enrollments = DB.get('enrollments');
  const students = users.filter(u => u.role === 'student');
  const isAdmin = currentUser.role === 'admin';

  const myEnrollments = enrollments.filter(e => e.userId === currentUser.id);

  const stats = isAdmin
    ? [
        { icon: '📖', num: courses.length, label: 'Total Courses' },
        { icon: '👨‍🎓', num: students.length, label: 'Total Students' },
        { icon: '📋', num: enrollments.length, label: 'Total Enrollments' },
        { icon: '📢', num: DB.get('announcements').length, label: 'Announcements' },
      ]
    : [
        { icon: '📖', num: courses.length, label: 'Available Courses' },
        { icon: '📋', num: myEnrollments.length, label: 'My Enrollments' },
        { icon: '📊', num: DB.get('grades').filter(g => g.userId === currentUser.id).length, label: 'Grades Received' },
        { icon: '📢', num: DB.get('announcements').length, label: 'Announcements' },
      ];

  document.getElementById('statsGrid').innerHTML = stats.map(s =>
    `<div class="stat-card"><div class="stat-icon">${s.icon}</div><div class="stat-num">${s.num}</div><div class="stat-label">${s.label}</div></div>`
  ).join('');

  const anns = DB.get('announcements').slice(-3).reverse();
  document.getElementById('recentAnnouncements').innerHTML = anns.length
    ? anns.map(a => `<div class="ann-card"><h4>${a.title}</h4><p>${a.content}</p><div class="ann-meta">📅 ${a.date} · ${a.author}</div></div>`).join('')
    : '<p style="color:#aaa">No announcements yet.</p>';
}

// ─── COURSES ────────────────────────────────────────────────────────────────

function renderCourses() {
  const q = document.getElementById('courseSearch').value.toLowerCase();
  const courses = DB.get('courses').filter(c => c.title.toLowerCase().includes(q) || c.category.toLowerCase().includes(q));
  const enrollments = DB.get('enrollments');
  const isAdmin = currentUser.role === 'admin';

  document.getElementById('courseList').innerHTML = courses.map(c => {
    const enrolled = enrollments.some(e => e.userId === currentUser.id && e.courseId === c.id);
    return `
      <div class="course-card">
        <span class="badge">${c.category}</span>
        <h3>${c.title}</h3>
        <p>${c.description}</p>
        <div class="meta">👨‍🏫 ${c.instructor} &nbsp;|&nbsp; ⏱ ${c.duration}h</div>
        <div class="card-actions">
          ${!isAdmin ? `<button class="btn-enroll ${enrolled ? 'enrolled' : ''}" onclick="toggleEnroll(${c.id})">${enrolled ? '✓ Enrolled' : 'Enroll'}</button>` : ''}
          ${isAdmin ? `<button class="btn-delete" onclick="deleteCourse(${c.id})">🗑 Delete</button>` : ''}
        </div>
      </div>`;
  }).join('') || '<p style="color:#aaa">No courses found.</p>';
}

function addCourse() {
  const title = document.getElementById('courseTitle').value.trim();
  const instructor = document.getElementById('courseInstructor').value.trim();
  const description = document.getElementById('courseDesc').value.trim();
  const duration = parseInt(document.getElementById('courseDuration').value);
  const category = document.getElementById('courseCategory').value;

  if (!title || !instructor || !description || !duration) return alert('Fill all fields.');

  const courses = DB.get('courses');
  courses.push({ id: Date.now(), title, instructor, description, duration, category });
  DB.set('courses', courses);
  closeModal('courseModal');
  renderCourses();
  renderDashboard();
  document.getElementById('courseTitle').value = '';
  document.getElementById('courseInstructor').value = '';
  document.getElementById('courseDesc').value = '';
  document.getElementById('courseDuration').value = '';
}

function deleteCourse(id) {
  if (!confirm('Delete this course?')) return;
  DB.set('courses', DB.get('courses').filter(c => c.id !== id));
  DB.set('enrollments', DB.get('enrollments').filter(e => e.courseId !== id));
  DB.set('grades', DB.get('grades').filter(g => g.courseId !== id));
  renderCourses();
  renderDashboard();
}

function toggleEnroll(courseId) {
  const enrollments = DB.get('enrollments');
  const idx = enrollments.findIndex(e => e.userId === currentUser.id && e.courseId === courseId);
  if (idx >= 0) enrollments.splice(idx, 1);
  else enrollments.push({ userId: currentUser.id, courseId });
  DB.set('enrollments', enrollments);
  renderCourses();
  renderDashboard();
}

// ─── STUDENTS ───────────────────────────────────────────────────────────────

function renderStudents() {
  const q = document.getElementById('studentSearch').value.toLowerCase();
  const students = DB.get('users').filter(u => u.role === 'student' && (u.name.toLowerCase().includes(q) || u.username.toLowerCase().includes(q)));
  const enrollments = DB.get('enrollments');
  const courses = DB.get('courses');

  document.getElementById('studentTable').innerHTML = students.map(s => {
    const enrolled = enrollments.filter(e => e.userId === s.id).map(e => courses.find(c => c.id === e.courseId)?.title).filter(Boolean).join(', ') || 'None';
    return `<tr>
      <td>${s.name}</td><td>${s.username}</td><td>${s.email}</td>
      <td>${enrolled}</td>
      <td><button class="btn-sm btn-danger" onclick="deleteStudent(${s.id})">Remove</button></td>
    </tr>`;
  }).join('') || '<tr><td colspan="5" style="text-align:center;color:#aaa">No students found.</td></tr>';
}

function deleteStudent(id) {
  if (!confirm('Remove this student?')) return;
  DB.set('users', DB.get('users').filter(u => u.id !== id));
  DB.set('enrollments', DB.get('enrollments').filter(e => e.userId !== id));
  DB.set('grades', DB.get('grades').filter(g => g.userId !== id));
  renderStudents();
  renderDashboard();
}

// ─── MY COURSES ─────────────────────────────────────────────────────────────

function renderMyCourses() {
  const enrollments = DB.get('enrollments').filter(e => e.userId === currentUser.id);
  const courses = DB.get('courses');
  const myCourses = enrollments.map(e => courses.find(c => c.id === e.courseId)).filter(Boolean);

  document.getElementById('myCourseList').innerHTML = myCourses.map(c => `
    <div class="course-card">
      <span class="badge">${c.category}</span>
      <h3>${c.title}</h3>
      <p>${c.description}</p>
      <div class="meta">👨‍🏫 ${c.instructor} &nbsp;|&nbsp; ⏱ ${c.duration}h</div>
      <div class="card-actions">
        <button class="btn-enroll enrolled" onclick="toggleEnroll(${c.id}); renderMyCourses()">✓ Enrolled</button>
      </div>
    </div>`).join('') || '<p style="color:#aaa">You have not enrolled in any courses yet.</p>';
}

// ─── GRADES ─────────────────────────────────────────────────────────────────

function getGradeLetter(marks) {
  if (marks >= 90) return { letter: 'A', cls: 'grade-a' };
  if (marks >= 75) return { letter: 'B', cls: 'grade-b' };
  if (marks >= 60) return { letter: 'C', cls: 'grade-c' };
  return { letter: 'F', cls: 'grade-f' };
}

function renderGrades() {
  const grades = DB.get('grades');
  const users = DB.get('users');
  const courses = DB.get('courses');
  const isAdmin = currentUser.role === 'admin';

  const filtered = isAdmin ? grades : grades.filter(g => g.userId === currentUser.id);

  document.getElementById('gradeTable').innerHTML = filtered.map(g => {
    const user = users.find(u => u.id === g.userId);
    const course = courses.find(c => c.id === g.courseId);
    const { letter, cls } = getGradeLetter(g.marks);
    return `<tr>
      <td>${user?.name || 'N/A'}</td>
      <td>${course?.title || 'N/A'}</td>
      <td><span class="${cls}">${letter}</span></td>
      <td>${g.marks}/100</td>
      ${isAdmin ? `<td><button class="btn-sm btn-danger" onclick="deleteGrade(${g.id})">Delete</button></td>` : '<td></td>'}
    </tr>`;
  }).join('') || '<tr><td colspan="5" style="text-align:center;color:#aaa">No grades found.</td></tr>';
}

function addGrade() {
  const userId = parseInt(document.getElementById('gradeStudent').value);
  const courseId = parseInt(document.getElementById('gradeCourse').value);
  const marks = parseInt(document.getElementById('gradeMarks').value);

  if (!userId || !courseId || isNaN(marks) || marks < 0 || marks > 100) return alert('Fill all fields correctly.');

  const grades = DB.get('grades');
  const existing = grades.find(g => g.userId === userId && g.courseId === courseId);
  if (existing) { existing.marks = marks; }
  else { grades.push({ id: Date.now(), userId, courseId, marks }); }
  DB.set('grades', grades);
  closeModal('gradeModal');
  renderGrades();
}

function deleteGrade(id) {
  if (!confirm('Delete this grade?')) return;
  DB.set('grades', DB.get('grades').filter(g => g.id !== id));
  renderGrades();
}

function populateGradeModal() {
  const students = DB.get('users').filter(u => u.role === 'student');
  const courses = DB.get('courses');
  document.getElementById('gradeStudent').innerHTML = students.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
  document.getElementById('gradeCourse').innerHTML = courses.map(c => `<option value="${c.id}">${c.title}</option>`).join('');
}

// ─── ANNOUNCEMENTS ──────────────────────────────────────────────────────────

function renderAnnouncements() {
  const anns = DB.get('announcements').reverse();
  const isAdmin = currentUser.role === 'admin';

  document.getElementById('announcementList').innerHTML = anns.map(a => `
    <div class="ann-card">
      <h4>${a.title}</h4>
      <p>${a.content}</p>
      <div class="ann-meta">📅 ${a.date} · Posted by ${a.author}</div>
      ${isAdmin ? `<div class="ann-actions"><button class="btn-sm btn-danger" onclick="deleteAnnouncement(${a.id})">Delete</button></div>` : ''}
    </div>`).join('') || '<p style="color:#aaa">No announcements.</p>';
}

function addAnnouncement() {
  const title = document.getElementById('annTitle').value.trim();
  const content = document.getElementById('annContent').value.trim();
  if (!title || !content) return alert('Fill all fields.');

  const anns = DB.get('announcements');
  anns.push({ id: Date.now(), title, content, author: currentUser.name, date: new Date().toISOString().split('T')[0] });
  DB.set('announcements', anns);
  closeModal('announcementModal');
  renderAnnouncements();
  document.getElementById('annTitle').value = '';
  document.getElementById('annContent').value = '';
}

function deleteAnnouncement(id) {
  if (!confirm('Delete this announcement?')) return;
  DB.set('announcements', DB.get('announcements').filter(a => a.id !== id));
  renderAnnouncements();
}

// ─── MODALS ─────────────────────────────────────────────────────────────────

function openModal(id) {
  if (id === 'gradeModal') populateGradeModal();
  document.getElementById(id).classList.add('open');
}

function closeModal(id) {
  document.getElementById(id).classList.remove('open');
}

// Close modal on backdrop click
document.querySelectorAll('.modal').forEach(m => {
  m.addEventListener('click', e => { if (e.target === m) m.classList.remove('open'); });
});

// ─── TAB SWITCH ─────────────────────────────────────────────────────────────

function showTab(tab) {
  document.getElementById('loginTab').style.display = tab === 'login' ? 'block' : 'none';
  document.getElementById('registerTab').style.display = tab === 'register' ? 'block' : 'none';
  document.querySelectorAll('.tab-btn').forEach((b, i) => b.classList.toggle('active', (i === 0) === (tab === 'login')));
}

// ─── INIT ────────────────────────────────────────────────────────────────────

seedData();

// Auto-login if session exists
const saved = DB.getObj('currentUser');
if (saved) { currentUser = saved; initDashboard(); }
