import React, { JSX, useEffect, useState } from 'react'
import Link from 'next/link'


type StudentStats = {
    courses: number
    assignmentsDue: number
    messages: number
    gpa: number
}

export default function DashboardOverview(): JSX.Element {
    const [stats, setStats] = useState<StudentStats | null>(null)
    const [recentActivity, setRecentActivity] = useState<string[]>([])

    useEffect(() => {
        // Startup / placeholder data - replace with real API calls
        setStats({
            courses: 5,
            assignmentsDue: 2,
            messages: 3,
            gpa: 3.8,
        })

        setRecentActivity([
            'Submitted: Math homework 3',
            'New announcement in Biology 101',
            'Grade posted: Chemistry Lab',
        ])
    }, [])

    return (
        <main style={{ padding: 24, fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif' }}>
            <header style={{ marginBottom: 20 }}>
                <h1 style={{ margin: 0, fontSize: 28 }}>Student Dashboard</h1>
                <p style={{ margin: '6px 0 0', color: '#555' }}>Overview of your classes, assignments and messages</p>
            </header>

            <section aria-label="Quick stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 12, marginBottom: 20 }}>
                <StatCard label="Courses" value={stats?.courses ?? '—'} />
                <StatCard label="Assignments Due" value={stats?.assignmentsDue ?? '—'} />
                <StatCard label="Messages" value={stats?.messages ?? '—'} />
                <StatCard label="GPA" value={stats?.gpa ?? '—'} />
            </section>

            <section aria-label="Recent activity" style={{ marginBottom: 20 }}>
                <h2 style={{ fontSize: 18, marginBottom: 8 }}>Recent Activity</h2>
                <ul style={{ paddingLeft: 16, margin: 0, color: '#333' }}>
                    {recentActivity.length === 0 ? <li>No recent activity</li> : recentActivity.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
            </section>

            <nav>
                <Link href="/student/courses" style={{ display: 'inline-block', padding: '8px 12px', background: '#0366d6', color: '#fff', borderRadius: 6, textDecoration: 'none' }}>
                    Go to Courses
                </Link>
            </nav>
        </main>
    )
}

function StatCard({ label, value }: { label: string; value: number | string }) {
    return (
        <div role="group" aria-label={label} style={{ border: '1px solid #e6e6e6', borderRadius: 8, padding: 12, background: '#fff' }}>
            <div style={{ fontSize: 12, color: '#666' }}>{label}</div>
            <div style={{ fontSize: 22, fontWeight: 600, marginTop: 6 }}>{value}</div>
        </div>
    )
}