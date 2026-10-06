Community Library Dashboard

Deployed base: https://nextjs-dashboard-chi-flax-58.vercel.app/
Repo: https://github.com/Wian2/learn-nextjs
Student: Wian Brits

1. Domain

A small community library that manages its book collection, registered members, and book loans.

The librarian uses the dashboard each week to decide which books should be purchased or replaced and whether members are returning books on time. Library assistants use it to manage members and record loans and returns.

2. Entities (exactly three)
Entity	Replaces	Fields (name: type)
books	customers	id: uuid, user_id: uuid, title: text, author: text, isbn: text, genre: text, published_year: integer, created_at: timestamp
borrowings	invoices	id: uuid, user_id: uuid, book_id: uuid (fk to books), member_id: uuid (fk to members), borrowed_at: timestamp, due_at: timestamp, returned_at: timestamp, status: enum(borrowed, returned, overdue), created_at: timestamp
members	revenue	id: uuid, user_id: uuid, full_name: text, email: text, phone: text, membership_type: enum(standard, student), joined_at: timestamp, created_at: timestamp
3. Charts (exactly two)
#	Question it answers	Who acts on the answer	Chart type	Data it needs
1	Is the library's collection growing? How many new books were added each month over the last 6 months?	librarian decides whether more books need to be purchased	bar, one bar per month	count of books by month of created_at, last 6 months
2	Which books are most in demand? Which books have been borrowed most often this month?	librarian decides which popular books need additional copies	horizontal bar, one bar per book	borrowings this month grouped by book_id and joined to books for the title
4. Roles
Role	Can see	Can change
librarian	all books, members and borrowings	create, edit and delete books; create, edit and delete members; create and edit borrowings
library assistant	books, members and borrowings	create and edit members; create and edit borrowings; no deleting books or members
5. Stretch

A realtime dashboard notification showing when a book is returned, so library staff can see immediately when it becomes available for the next member.

6. Out of scope

Online member registration, online book reservations, payment processing, book reviews or ratings, multiple library branches, automatic email/SMS reminders, and a mobile app.