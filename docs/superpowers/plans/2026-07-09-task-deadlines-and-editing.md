# Task Deadlines and Admin Editing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enable administrators to assign due dates (deadlines) to tasks during creation and modify existing tasks (including title, description, assigned employees, and deadlines) through a high-contrast, padded modal interface.

**Architecture:** Add a nullable `due_date` column to the `tasks` table, define a PUT route and controller update in Laravel, update the API services, render edit pencil buttons for admins on cards, and implement the Edit dialog in the Admin Dashboard with upgraded layout styles.

**Tech Stack:** React, Material UI v9, Laravel, SQLite/MySQL.

---

### Task 1: Database Migration (Laravel Backend)

**Files:**
- Modify: `backend/database/migrations/2026_07_08_210211_add_due_date_to_tasks_table.php`

- [ ] **Step 1: Write migration up and down methods**
  Update the generated migration file to add a nullable `due_date` column of type `date`.
  ```php
  <?php

  use Illuminate\Database\Migrations\Migration;
  use Illuminate\Database\Schema\Blueprint;
  use Illuminate\Support\Facades\Schema;

  return new class extends Migration
  {
      public function up(): void
      {
          Schema::table('tasks', function (Blueprint $table) {
              $table->date('due_date')->nullable()->after('status');
          });
      }

      public function down(): void
      {
          Schema::table('tasks', function (Blueprint $table) {
              $table->dropColumn('due_date');
          });
      }
  };
  ```

- [ ] **Step 2: Run migration to update database**
  Run: `php artisan migrate` in the `backend/` directory.
  Expected output: `INFO  Migrating ... 2026_07_08_210211_add_due_date_to_tasks_table ...` and `INFO  Migrated ...`

- [ ] **Step 3: Commit migration changes**
  Run:
  ```bash
  git add backend/database/migrations/2026_07_08_210211_add_due_date_to_tasks_table.php
  git commit -m "db: add due_date column to tasks table migration"
  ```

---

### Task 2: Model, Routes & Controller Changes (Laravel Backend)

**Files:**
- Modify: `backend/app/Models/Task.php`
- Modify: `backend/routes/api.php`
- Modify: `backend/app/Http/Controllers/TaskController.php`

- [ ] **Step 1: Add due_date to Task model fillable fields**
  Add `'due_date'` to the `$fillable` array in `backend/app/Models/Task.php`:
  ```php
  protected $fillable = ['title', 'description', 'status', 'due_date'];
  ```

- [ ] **Step 2: Define PUT route for task updates**
  Ensure routes in `backend/routes/api.php` support updating tasks.
  Add this PUT route inside the api routes:
  ```php
  Route::put('/tasks/{id}', [TaskController::class, 'update']);
  ```

- [ ] **Step 3: Update store and implement update methods in TaskController**
  Modify `backend/app/Http/Controllers/TaskController.php` to accept `due_date` on creation and implement `update()` to sync fields and pivot relationships:
  ```php
  public function store(Request $request)
  {
      $validated = $request->validate([
          'title' => 'required|string|max:255',
          'description' => 'nullable|string',
          'due_date' => 'nullable|date',
          'user_ids' => 'required|array',
          'user_ids.*' => 'exists:users,id',
      ]);

      $task = Task::create([
          'title' => $validated['title'],
          'description' => $validated['description'] ?? null,
          'due_date' => $validated['due_date'] ?? null,
          'status' => 'pending',
      ]);

      $task->users()->sync($validated['user_ids']);

      return response()->json($task->load('users'), 201);
  }

  public function update(Request $request, $id)
  {
      $task = Task::findOrFail($id);

      $validated = $request->validate([
          'title' => 'required|string|max:255',
          'description' => 'nullable|string',
          'due_date' => 'nullable|date',
          'status' => 'sometimes|string|in:pending,in_progress,completed',
          'user_ids' => 'required|array',
          'user_ids.*' => 'exists:users,id',
      ]);

      $task->update([
          'title' => $validated['title'],
          'description' => $validated['description'] ?? null,
          'due_date' => $validated['due_date'] ?? null,
          'status' => $validated['status'] ?? $task->status,
      ]);

      $task->users()->sync($validated['user_ids']);

      return response()->json($task->load('users'), 200);
  }
  ```

- [ ] **Step 4: Commit backend controller updates**
  Run:
  ```bash
  git add backend/app/Models/Task.php backend/routes/api.php backend/app/Http/Controllers/TaskController.php
  git commit -m "feat: implement update task endpoint and fillable due_date fields"
  ```

---

### Task 3: API Service Integration (Frontend)

**Files:**
- Modify: `frontend/src/services/apiService.js`

- [ ] **Step 1: Update API call methods**
  Modify `frontend/src/services/apiService.js` to support task editing:
  Add `updateTask` to exports:
  ```javascript
  export const updateTask = (taskId, data) => api.put(`/tasks/${taskId}`, data);
  ```

- [ ] **Step 2: Commit API service integrations**
  Run:
  ```bash
  git add frontend/src/services/apiService.js
  git commit -m "feat: add updateTask API wrapper method"
  ```

---

### Task 4: TaskCard Actions & Real Deadline Display (Frontend)

**Files:**
- Modify: `frontend/src/components/TaskCard.jsx`

- [ ] **Step 1: Render edit icons and display database deadlines**
  Update `frontend/src/components/TaskCard.jsx` to render an edit button (admin only) and show real due dates.
  Imports:
  ```javascript
  import EditIcon from '@mui/icons-material/Edit';
  import { useAuth } from '../context/AuthContext';
  ```
  Inside TaskCard, add auth user role checks and read actual `task.due_date`:
  ```javascript
  const { user: currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'admin';

  const formattedDeadline = task.due_date ? new Date(task.due_date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }) : 'No deadline';
  ```
  Render the pencil icon next to status chip for admins:
  ```jsx
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexGrow: 1, pr: 1 }}>
    <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.05rem', color: '#f8fafc' }}>
      {task.title}
    </Typography>
    {isAdmin && onEditClick && (
      <IconButton 
        size="small" 
        onClick={() => onEditClick(task)} 
        sx={{ color: '#94a3b8', ml: 0.5, p: 0.5, '&:hover': { color: '#10b981', bgcolor: 'rgba(255,255,255,0.03)' } }}
      >
        <EditIcon sx={{ fontSize: '1rem' }} />
      </IconButton>
    )}
  </Box>
  ```
  Ensure `onEditClick` is accepted as a prop:
  ```javascript
  const TaskCard = ({ task, isEmployeeView, onStatusChange, onEditClick }) => {
  ```

- [ ] **Step 2: Commit TaskCard updates**
  Run:
  ```bash
  git add frontend/src/components/TaskCard.jsx
  git commit -m "design: render admin task edit icon and print actual database due_dates"
  ```

---

### Task 5: AdminDashboard Modals & Filter High-Contrast Upgrades (Frontend)

**Files:**
- Modify: `frontend/src/pages/AdminDashboard.jsx`

- [ ] **Step 1: Add date input to Create Task modal and implement Edit Task modal**
  Include `dueDate` state in `AdminDashboard.jsx`. Add the second `Dialog` for editing.
  Configure states:
  ```javascript
  const [dueDate, setDueDate] = useState('');
  const [editingTask, setEditingTask] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editAssignedUserIds, setEditAssignedUserIds] = useState([]);
  const [editDueDate, setEditDueDate] = useState('');
  ```
  Update Create submit payload to pass `due_date: dueDate` and reset states:
  ```javascript
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || assignedUserIds.length === 0) return;

    try {
      await createTask({
        title,
        description,
        due_date: dueDate || null,
        user_ids: assignedUserIds,
      });
      setTitle('');
      setDescription('');
      setDueDate('');
      setAssignedUserIds([]);
      setOpen(false);
      setPage(1);
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      console.error('Failed to assign task', err);
    }
  };
  ```
  Implement the edit handler triggers:
  ```javascript
  const handleEditClick = (task) => {
    setEditingTask(task);
    setEditTitle(task.title);
    setEditDescription(task.description || '');
    setEditDueDate(task.due_date || '');
    setEditAssignedUserIds(task.users ? task.users.map((u) => u.id) : []);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editTitle.trim() || editAssignedUserIds.length === 0) return;

    try {
      await updateTask(editingTask.id, {
        title: editTitle,
        description: editDescription,
        due_date: editDueDate || null,
        user_ids: editAssignedUserIds,
      });
      setEditingTask(null);
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      console.error('Failed to update task details', err);
    }
  };
  ```
  Update `<TaskCard>` maps to pass `onEditClick={handleEditClick}`:
  ```jsx
  <TaskCard key={task.id} task={task} onEditClick={handleEditClick} />
  ```
  Insert date picker field into **Create Task Modal**:
  ```jsx
  <Typography variant="body2" sx={{ color: '#e2e8f0', display: 'block', mb: 1, fontWeight: 600, fontSize: '0.85rem' }}>
    Due Date
  </Typography>
  <TextField
    fullWidth
    type="date"
    variant="outlined"
    value={dueDate}
    onChange={(e) => setDueDate(e.target.value)}
    sx={{
      mb: 3,
      '& .MuiOutlinedInput-root': {
        background: '#0b0f19',
        borderRadius: '10px',
        '& fieldset': { borderColor: '#1c253d' },
        '&:hover fieldset': { borderColor: '#2e3b5e' },
        '&.Mui-focused fieldset': { borderColor: '#10b981' },
      },
      '& input': { py: 1.5, fontSize: '0.85rem', color: '#f8fafc' }
    }}
  />
  ```
  Append the **Edit Task Dialog Modal**:
  ```jsx
  <Dialog
    open={Boolean(editingTask)}
    onClose={() => setEditingTask(null)}
    slotProps={{
      backdrop: {
        sx: {
          backgroundColor: 'rgba(3, 7, 18, 0.65)',
          backdropFilter: 'blur(8px)',
        }
      }
    }}
    PaperProps={{
      sx: {
        background: '#0e1424',
        border: '1px solid #1c253d',
        borderRadius: '16px',
        width: '460px',
        maxWidth: '90%',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)',
      }
    }}
  >
    <Box sx={{ p: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800, fontFamily: '"Outfit", sans-serif', color: '#f8fafc', letterSpacing: '-0.02em', fontSize: '1.25rem', lineHeight: 1.2 }}>
            Edit Task
          </Typography>
          <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600, display: 'block', mt: 0.5, fontSize: '0.75rem' }}>
            Modify task attributes and deadline
          </Typography>
        </Box>
        <IconButton onClick={() => setEditingTask(null)} sx={{ color: '#cbd5e1', p: 0.5, '&:hover': { color: '#f8fafc', bgcolor: 'rgba(255,255,255,0.05)' } }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      <form onSubmit={handleEditSubmit}>
        <Typography variant="body2" sx={{ color: '#e2e8f0', display: 'block', mb: 1, fontWeight: 600, fontSize: '0.85rem' }}>
          Title
        </Typography>
        <TextField
          fullWidth
          placeholder="Task title..."
          variant="outlined"
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          sx={{
            mb: 3,
            '& .MuiOutlinedInput-root': {
              background: '#0b0f19',
              borderRadius: '10px',
              '& fieldset': { borderColor: '#1c253d' },
              '&:hover fieldset': { borderColor: '#2e3b5e' },
              '&.Mui-focused fieldset': { borderColor: '#10b981' },
            },
            '& input': { py: 1.5, fontSize: '0.85rem', color: '#f8fafc' },
            '& input::placeholder': { color: '#64748b', opacity: 1 }
          }}
          required
        />

        <Typography variant="body2" sx={{ color: '#e2e8f0', display: 'block', mb: 1, fontWeight: 600, fontSize: '0.85rem' }}>
          Description
        </Typography>
        <TextField
          fullWidth
          placeholder="Task description details..."
          variant="outlined"
          multiline
          rows={4}
          value={editDescription}
          onChange={(e) => setEditDescription(e.target.value)}
          sx={{
            mb: 3,
            '& .MuiOutlinedInput-root': {
              background: '#0b0f19',
              borderRadius: '10px',
              '& fieldset': { borderColor: '#1c253d' },
              '&:hover fieldset': { borderColor: '#2e3b5e' },
              '&.Mui-focused fieldset': { borderColor: '#10b981' },
            },
            '& textarea': { fontSize: '0.85rem', color: '#f8fafc' },
            '& textarea::placeholder': { color: '#64748b', opacity: 1 }
          }}
        />

        <Typography variant="body2" sx={{ color: '#e2e8f0', display: 'block', mb: 1, fontWeight: 600, fontSize: '0.85rem' }}>
          Due Date
        </Typography>
        <TextField
          fullWidth
          type="date"
          variant="outlined"
          value={editDueDate}
          onChange={(e) => setEditDueDate(e.target.value)}
          sx={{
            mb: 3,
            '& .MuiOutlinedInput-root': {
              background: '#0b0f19',
              borderRadius: '10px',
              '& fieldset': { borderColor: '#1c253d' },
              '&:hover fieldset': { borderColor: '#2e3b5e' },
              '&.Mui-focused fieldset': { borderColor: '#10b981' },
            },
            '& input': { py: 1.5, fontSize: '0.85rem', color: '#f8fafc' }
          }}
        />

        <Typography variant="body2" sx={{ color: '#e2e8f0', display: 'block', mb: 1, fontWeight: 600, fontSize: '0.85rem' }}>
          Assign Employees
        </Typography>
        <FormControl fullWidth sx={{ mb: 4.5 }}>
          <Select
            multiple
            displayEmpty
            value={editAssignedUserIds}
            onChange={(e) => setEditAssignedUserIds(e.target.value)}
            input={
              <OutlinedInput
                sx={{
                  background: '#0b0f19',
                  borderRadius: '10px',
                  '& fieldset': { borderColor: '#1c253d' },
                  '&:hover fieldset': { borderColor: '#2e3b5e' },
                  '&.Mui-focused fieldset': { borderColor: '#10b981' },
                  '& .MuiSelect-select': { py: 1.5, fontSize: '0.85rem', color: '#f8fafc' }
                }}
              />
            }
            renderValue={(selected) => {
              if (selected.length === 0) {
                return <span style={{ color: '#64748b' }}>[Search/Select Employees...]</span>;
              }
              return (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((id) => {
                    const emp = employees.find((e) => e.id === id);
                    return emp ? (
                      <Chip
                        key={id}
                        label={emp.name}
                        size="small"
                        sx={{
                          bgcolor: 'rgba(16, 185, 129, 0.1)',
                          color: '#10b981',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          height: '22px'
                        }}
                      />
                    ) : null;
                  })}
                </Box>
              );
            }}
          >
            {employees.map((employee) => (
              <MenuItem key={employee.id} value={employee.id} sx={{ py: 0.5 }}>
                <Checkbox checked={editAssignedUserIds.indexOf(employee.id) > -1} size="small" />
                <ListItemText primary={employee.name} primaryTypographyProps={{ fontSize: '0.85rem' }} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            fullWidth
            variant="outlined"
            onClick={() => setEditingTask(null)}
            sx={{
              height: '44px',
              color: '#94a3b8',
              borderColor: '#1c253d',
              textTransform: 'none',
              fontWeight: 'bold',
              borderRadius: '10px',
              '&:hover': { borderColor: '#2e3b5e', background: 'rgba(255, 255, 255, 0.02)' }
            }}
          >
            Cancel
          </Button>
          <Button
            fullWidth
            variant="contained"
            type="submit"
            sx={{
              height: '44px',
              bgcolor: '#10b981',
              color: '#090d16',
              textTransform: 'none',
              fontWeight: 'bold',
              borderRadius: '10px',
              '&:hover': { bgcolor: '#059669' }
            }}
          >
            Save Changes
          </Button>
        </Box>
      </form>
    </Box>
  </Dialog>
  ```

- [ ] **Step 2: Upgrade Filter & Sort Popover dropdown contrasts**
  Update the Filter & Sort Menu in `frontend/src/pages/AdminDashboard.jsx`:
  Change the layout padding to `p: 3`, update all subheaders to bold `#e2e8f0`, update radio texts and select options to high-contrast `#cbd5e1`, and update select background inputs to `#0b0f19`:
  ```jsx
      {/* FILTER & SORT DROPDOWN MENU */}
      <Menu
        anchorEl={filterAnchorEl}
        open={Boolean(filterAnchorEl)}
        onClose={handleFilterClose}
        PaperProps={{
          sx: {
            width: '280px',
            background: '#0e1424',
            border: '1px solid #1c253d',
            color: '#f8fafc',
            p: 3, // generous padding
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
          }
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 800, fontFamily: '"Outfit", sans-serif', mb: 2, pb: 0.5, borderBottom: '1px solid #1c253d', color: '#f8fafc' }}>
          Sort & Filters
        </Typography>

        {/* Sort Group */}
        <Typography variant="caption" sx={{ color: '#e2e8f0', fontWeight: 'bold', display: 'block', mb: 1, textTransform: 'uppercase' }}>
          Sort by
        </Typography>
        <RadioGroup 
          value={sortOrder} 
          onChange={(e) => {
            setSortOrder(e.target.value);
            setPage(1);
          }} 
          sx={{ mb: 3 }}
        >
          <FormControlLabel 
            value="newest" 
            control={<Radio size="small" sx={{ color: '#1c253d', '&.Mui-checked': { color: '#10b981' } }} />} 
            label="Newest First" 
            componentsProps={{ typography: { fontSize: '0.8rem', color: '#cbd5e1' } }}
          />
          <FormControlLabel 
            value="oldest" 
            control={<Radio size="small" sx={{ color: '#1c253d', '&.Mui-checked': { color: '#10b981' } }} />} 
            label="Oldest First" 
            componentsProps={{ typography: { fontSize: '0.8rem', color: '#cbd5e1' } }}
          />
          <FormControlLabel 
            value="alphabetical" 
            control={<Radio size="small" sx={{ color: '#1c253d', '&.Mui-checked': { color: '#10b981' } }} />} 
            label="Alphabetical (A-Z)" 
            componentsProps={{ typography: { fontSize: '0.8rem', color: '#cbd5e1' } }}
          />
        </RadioGroup>

        {/* Status Filter Group */}
        <Typography variant="caption" sx={{ color: '#e2e8f0', fontWeight: 'bold', display: 'block', mb: 1, textTransform: 'uppercase' }}>
          Filter Status
        </Typography>
        <FormControl fullWidth size="small" sx={{ mb: 3 }}>
          <Select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            sx={{
              background: '#0b0f19', // High contrast background
              fontSize: '0.8rem',
              color: '#f8fafc',
              '& fieldset': { borderColor: '#1c253d' },
              '&:hover fieldset': { borderColor: '#2e3b5e' },
            }}
          >
            <MenuItem value="all" sx={{ fontSize: '0.8rem' }}>All Statuses</MenuItem>
            <MenuItem value="pending" sx={{ fontSize: '0.8rem' }}>Pending</MenuItem>
            <MenuItem value="in_progress" sx={{ fontSize: '0.8rem' }}>In Progress</MenuItem>
            <MenuItem value="completed" sx={{ fontSize: '0.8rem' }}>Completed</MenuItem>
          </Select>
        </FormControl>

        {/* Assignee Filter Group */}
        <Typography variant="caption" sx={{ color: '#e2e8f0', fontWeight: 'bold', display: 'block', mb: 1, textTransform: 'uppercase' }}>
          Filter Assignee
        </Typography>
        <FormControl fullWidth size="small" sx={{ mb: 1 }}>
          <Select
            value={employeeFilter}
            onChange={(e) => {
              setEmployeeFilter(e.target.value);
              setPage(1);
            }}
            sx={{
              background: '#0b0f19', // High contrast background
              fontSize: '0.8rem',
              color: '#f8fafc',
              '& fieldset': { borderColor: '#1c253d' },
              '&:hover fieldset': { borderColor: '#2e3b5e' },
            }}
          >
            <MenuItem value="all" sx={{ fontSize: '0.8rem' }}>All Employees</MenuItem>
            {employees.map((emp) => (
              <MenuItem key={emp.id} value={emp.id} sx={{ fontSize: '0.8rem' }}>
                {emp.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Menu>
  ```

- [ ] **Step 3: Commit AdminDashboard changes**
  Run:
  ```bash
  git add frontend/src/pages/AdminDashboard.jsx
  git commit -m "design: add dueDate to creation modal, implement edit task modal, and increase Filter menu contrast"
  ```

---

### Task 6: Notification Popover Layout & Contrast Upgrades (Frontend)

**Files:**
- Modify: `frontend/src/App.jsx`

- [ ] **Step 1: Style Notification Bell popover**
  Locate the notification popover code in `frontend/src/App.jsx` and upgrade container padding (`p: 2.5` / `20px` spacing), list element contrast, and title headers:
  ```jsx
        {/* Notification Bell Popover */}
        <Popover
          open={Boolean(notificationAnchorEl)}
          anchorEl={notificationAnchorEl}
          onClose={() => setNotificationAnchorEl(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          PaperProps={{
            sx: {
              width: '320px',
              background: '#0e1424',
              border: '1px solid #1c253d',
              borderRadius: '12px',
              mt: 1.5,
              p: 2.5, // generous padding
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
            }
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, pb: 1, borderBottom: '1px solid #1c253d' }}>
            <Typography variant="body2" sx={{ fontWeight: 800, fontFamily: '"Outfit", sans-serif', color: '#f8fafc' }}>
              Notifications
            </Typography>
            {notifications.some(n => !n.read) && (
              <Button 
                variant="text" 
                size="small" 
                onClick={markAllNotificationsAsRead}
                sx={{ fontSize: '0.75rem', textTransform: 'none', color: '#10b981', minWidth: 0, p: 0, '&:hover': { color: '#059669', background: 'none' } }}
              >
                Mark all as read
              </Button>
            )}
          </Box>
          {notifications.length === 0 ? (
            <Typography variant="body2" sx={{ color: '#94a3b8', py: 2, textAlign: 'center', fontSize: '0.8rem' }}>
              No notifications.
            </Typography>
          ) : (
            <List disablePadding sx={{ maxHeight: '250px', overflowY: 'auto' }}>
              {notifications.map((n) => (
                <ListItem 
                  key={n.id} 
                  disablePadding 
                  sx={{ 
                    py: 1, 
                    borderBottom: '1px solid rgba(255,255,255,0.02)',
                    '&:last-child': { borderBottom: 'none' }
                  }}
                >
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, width: '100%' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Typography variant="body2" sx={{ fontSize: '0.8rem', color: '#f8fafc', fontWeight: n.read ? 500 : 700 }}>
                        {n.title}
                      </Typography>
                      {!n.read && (
                        <Box sx={{ width: 6, height: 6, bgcolor: '#10b981', borderRadius: '50%', mt: 0.8 }} />
                      )}
                    </Box>
                    <Typography variant="caption" sx={{ color: '#cbd5e1', fontSize: '0.75rem', lineHeight: 1.4 }}>
                      {n.message}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.65rem', mt: 0.2 }}>
                      {n.time}
                    </Typography>
                  </Box>
                </ListItem>
              ))}
            </List>
          )}
        </Popover>
  ```

- [ ] **Step 2: Commit Notification updates**
  Run:
  ```bash
  git add frontend/src/App.jsx
  git commit -m "design: upgrade Notification Bell popover layout padding and text colors"
  ```
