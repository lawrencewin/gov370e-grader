import React, { useState } from "react"

const Q_WEIGHTS = [ .2, .16, .12, .08, .04 ]

class GradeTracker {

    constructor () {
        this.participation = -1
        this.quizzes = []
        this.project = {
            1: -1,
            2: -1
        }
    }

    clearParticipation () {
        this.participation = -1
        return this
    }

    clearQuiz (num) {
        this.quizzes = this.quizzes.filter(q => q.num !== num)
        return this
    }

    clearProject (num) {
        this.setProject(-1, num)
        return this
    }

    setParticipation (grade) {
        this.participation = grade
        return this
    }

    setQuiz (grade, num) {
        let found = false
        this.quizzes.forEach(q => {
            if (q.num === num) {
                found = true
                q.grade = grade
            }
        })
        if (!found) this.quizzes.push({ num, grade })
        this.quizzes.sort((a, b) => b.grade - a.grade)
        return this
    }

    setProject (grade, num) {
        if (num === 1 || num === 2) {
            this.project[num] = grade
        }
        return this
    }

    get grade () {
        let total = 0
        if (this.participation >= 0) {
            total += this.participation * 0.15
        }
        // calculate quizzes
        total += this.quizzes.reduce((prev, curr, i) => {
            console.log(curr)
            return prev + curr.grade * Q_WEIGHTS[i]
        }, 0)
        // add project
        if (this.project[1] >= 0) total += this.project[1] * 0.15
        if (this.project[2] >= 0) total += this.project[2] * 0.1
        return total
    }

    get adjustedGrade () {
        let total = 0
        let divisor = 0
        if (this.participation >= 0) {
            total += this.participation * 0.15
            divisor += 0.15
        }
        // calculate quizzes
        total += this.quizzes.reduce((prev, curr, i) => {
            divisor += Q_WEIGHTS[i]
            return prev + curr.grade * Q_WEIGHTS[i]
        }, 0)
        // add project
        if (this.project[1] >= 0) {
            total += this.project[1] * 0.15
            divisor += 0.15
        }
        if (this.project[2] >= 0) {
            total += this.project[2] * 0.1
            divisor += 0.1
        }
        if (divisor === 0) return 0
        return total / divisor
    }

}

function clip (num, start=0, end=100) {
    return Math.min(Math.max(start, num), end)
}

const INPUTS = [
    { type: "participation", key: "participation", number: 0, label: "Participation" },
    { type: "quiz", key: "q1", number: 1, label: "Quiz 1" },
    { type: "quiz", key: "q2", number: 2, label: "Quiz 2" },
    { type: "quiz", key: "q3", number: 3, label: "Quiz 3" },
    { type: "quiz", key: "q4", number: 4, label: "Quiz 4" },
    { type: "quiz", key: "q5", number: 5, label: "Quiz 5" },
    { type: "project", key: "p1", number: 1, label: "Project 1" },
    { type: "project", key: "p2", number: 2, label: "Project 2" }
]

const gradeTracker = new GradeTracker()

export default function Grader () {
    const [ grade, setGrade ] = useState(0)
    const [ adjustedGrade, setAdjustedGrade ] = useState(0)
    const [ values, setValues ] = useState({
        participation: "",
        q1: "",
        q2: "",
        q3: "",
        q4: "",
        q5: "",
        p1: "",
        p2: ""
    })

    const handleChange = (key, value) => {
        setValues({
            ...values,
            [key]: value
        })
    }

    const handleBlur = (type, key, number) => {
        // vet input
        const input = values[key]
        const asFloat = parseFloat(input)
        if (input !== "" && isNaN(asFloat)) {
            setValues({
                ...values,
                [key]: ""
            })
            return
        } 
        // if good, continue
        if (input !== "") {
            const grade = clip(asFloat)
            setValues({ ...values, [key]: grade })
            if (type === "participation") {
                gradeTracker.setParticipation(grade)
            } else if (type === "quiz") {
                gradeTracker.setQuiz(grade, number)
            } else {
                gradeTracker.setProject(grade, number)
            }
            setGrade(gradeTracker.grade)
            setAdjustedGrade(gradeTracker.adjustedGrade)
        } else {
            setValues({ ...values, [key]: "" })
            if (type === "participation") {
                gradeTracker.clearParticipation()
            } else if (type === "quiz") {
                gradeTracker.clearQuiz(number)
            } else {
                gradeTracker.clearProject(number)
            }
            setGrade(gradeTracker.grade)
            setAdjustedGrade(gradeTracker.adjustedGrade)
        }
    }

    return (
        <div>
            { INPUTS.map(({ type, key, number, label }, i) => {
                return (
                    <div className="gradeInput" key={i} >
                        <label htmlFor={key}>{label} (out of 100)</label>
                        <input 
                            type="text" 
                            id={key} 
                            value={values[key]}
                            onChange={(e) => handleChange(key, e.target.value)}
                            onBlur={() => handleBlur(type, key, number)}
                        />
                    </div>
                )
            }) }
            <h2>Grades</h2>
            <div>
                <strong>Current Grade: </strong> { adjustedGrade }
            </div>
            <div>
                <strong>Final Grade: </strong> { grade }
            </div>
        </div>
    )
}