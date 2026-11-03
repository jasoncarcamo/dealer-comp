
import React, { Component } from "react";

import {
    Box,
    Button,
    Chip,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    ToggleButton,
    ToggleButtonGroup,
    Tooltip
} from "@mui/material";

import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import DirectionsCarRoundedIcon from "@mui/icons-material/DirectionsCarRounded";
import EmojiEventsRoundedIcon from "@mui/icons-material/EmojiEventsRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import PrintRoundedIcon from "@mui/icons-material/PrintRounded";
import PictureAsPdfRoundedIcon from "@mui/icons-material/PictureAsPdfRounded";

import "./History.css";

class History extends Component {
    constructor(props) {
        super(props);

        this.state = {
            selectedDate: this.getTodayDate(),
            viewMode: "day",
            downloading: false
        };

        this.reportRef = React.createRef();
    }

    getTodayDate = () => {
        const now = new Date();

        return [
            now.getFullYear(),
            String(now.getMonth() + 1).padStart(2, "0"),
            String(now.getDate()).padStart(2, "0")
        ].join("-");
    };

    normalizeDate = (value) => {
        if (!value) {
            return "";
        }

        if (typeof value === "string") {
            const match = value.match(/^\d{4}-\d{2}-\d{2}/);

            if (match) {
                return match[0];
            }
        }

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return "";
        }

        return [
            date.getFullYear(),
            String(date.getMonth() + 1).padStart(2, "0"),
            String(date.getDate()).padStart(2, "0")
        ].join("-");
    };

    parseLocalDate = (value) => {
        const [year, month, day] = value.split("-").map(Number);

        return new Date(year, month - 1, day);
    };

    formatDate = (date) => {
        return [
            date.getFullYear(),
            String(date.getMonth() + 1).padStart(2, "0"),
            String(date.getDate()).padStart(2, "0")
        ].join("-");
    };

    formatDisplayDate = (value) => {
        const date = this.parseLocalDate(value);

        return date.toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric"
        });
    };

    getDateRange = () => {
        const { selectedDate, viewMode } = this.state;
        const date = this.parseLocalDate(selectedDate);

        let startDate = new Date(date);
        let endDate = new Date(date);

        if (viewMode === "week") {
            startDate.setDate(date.getDate() - date.getDay());

            endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + 6);
        }

        if (viewMode === "month") {
            startDate = new Date(
                date.getFullYear(),
                date.getMonth(),
                1
            );

            endDate = new Date(
                date.getFullYear(),
                date.getMonth() + 1,
                0
            );
        }

        return {
            start: this.formatDate(startDate),
            end: this.formatDate(endDate)
        };
    };

    getPeriodLabel = () => {
        const { start, end } = this.getDateRange();

        if (start === end) {
            return this.formatDisplayDate(start);
        }

        return `${this.formatDisplayDate(start)} – ${this.formatDisplayDate(end)}`;
    };

    getTeamsForSelectedMonth = () => {
        const { teams = [] } = this.props;
        const month = this.state.selectedDate.slice(0, 7);

        return teams
            .filter((team) => {
                return this.normalizeDate(team.date).slice(0, 7) === month;
            })
            .sort((a, b) => a.name.localeCompare(b.name));
    };

    getSalesForRange = (start, end, memberNames) => {
        const { salesData = [] } = this.props;
        const totals = {};

        memberNames.forEach((name) => {
            totals[name] = 0;
        });

        salesData.forEach((entry) => {
            const date = this.normalizeDate(entry.date);

            if (date < start || date > end) {
                return;
            }

            memberNames.forEach((name) => {
                const value = Number(entry[name] || 0);

                if (Number.isFinite(value)) {
                    totals[name] += value;
                }
            });
        });

        return totals;
    };

    buildTeamResults = (teams, start, end) => {
        const names = [
            ...new Set(
                teams.flatMap((team) => team.members || [])
            )
        ];

        const personTotals = this.getSalesForRange(
            start,
            end,
            names
        );

        return teams.map((team) => {
            const members = (team.members || [])
                .map((name) => ({
                    name,
                    sales: personTotals[name] || 0
                }))
                .sort((a, b) => {
                    return b.sales - a.sales ||
                        a.name.localeCompare(b.name);
                });

            const total = members.reduce((sum, member) => {
                return sum + member.sales;
            }, 0);

            const highestMemberSales = Math.max(
                0,
                ...members.map((member) => member.sales)
            );

            return {
                id: team.id,
                name: team.name,
                color: team.color || "#EB0A1E",
                members,
                total,
                highestMemberSales
            };
        }).sort((a, b) => {
            return b.total - a.total ||
                a.name.localeCompare(b.name);
        });
    };

    getCurrentResults = () => {
        const teams = this.getTeamsForSelectedMonth();
        const { start, end } = this.getDateRange();

        return this.buildTeamResults(teams, start, end);
    };

    getMonthlyHistory = () => {
        const { teams = [] } = this.props;
        const grouped = {};

        teams.forEach((team) => {
            const month = this.normalizeDate(team.date).slice(0, 7);

            if (!/^\d{4}-\d{2}$/.test(month)) {
                return;
            }

            if (!grouped[month]) {
                grouped[month] = [];
            }

            grouped[month].push(team);
        });

        return Object.keys(grouped)
            .sort((a, b) => b.localeCompare(a))
            .map((month) => {
                const date = this.parseLocalDate(`${month}-01`);

                const end = this.formatDate(
                    new Date(
                        date.getFullYear(),
                        date.getMonth() + 1,
                        0
                    )
                );

                const results = this.buildTeamResults(
                    grouped[month],
                    `${month}-01`,
                    end
                );

                return {
                    month,
                    label: date.toLocaleDateString("en-US", {
                        month: "long",
                        year: "numeric"
                    }),
                    results,
                    total: results.reduce((sum, team) => {
                        return sum + team.total;
                    }, 0)
                };
            });
    };

    getSummary = (results) => {
        const allMembers = new Set();

        results.forEach((team) => {
            team.members.forEach((member) => {
                allMembers.add(member.name);
            });
        });

        const totalSales = results.reduce((sum, team) => {
            return sum + team.total;
        }, 0);

        const highestTotal = Math.max(
            0,
            ...results.map((team) => team.total)
        );

        return {
            totalSales,
            teamCount: results.length,
            salespersonCount: allMembers.size,
            highestTotal
        };
    };

    getTopSalespeople = (results) => {
        const people = results.flatMap((team) => {
            return team.members.map((member) => ({
                ...member,
                teamName: team.name
            }));
        });

        const highest = Math.max(
            0,
            ...people.map((person) => person.sales)
        );

        if (highest === 0) {
            return [];
        }

        return people.filter((person) => person.sales === highest);
    };

    handleDateChange = (event) => {
        const selectedDate = event.target.value;

        if (
            selectedDate &&
            selectedDate <= this.getTodayDate()
        ) {
            this.setState({ selectedDate });
        }
    };

    handleViewModeChange = (event, value) => {
        if (value) {
            this.setState({ viewMode: value });
        }
    };

    escapeHTML = (value) => {
        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    };

    buildPrintableReport = () => {
        const results = this.getCurrentResults();
        const summary = this.getSummary(results);
        const label = this.getPeriodLabel();

        const sections = results.map((team) => {
            const rows = team.members.map((member) => {
                const isTop = (
                    member.sales > 0 &&
                    member.sales === team.highestMemberSales
                );

                return `
                    <tr>
                        <td>
                            ${this.escapeHTML(member.name)}
                            ${isTop ? " (Top salesperson)" : ""}
                        </td>
                        <td class="number">${member.sales}</td>
                    </tr>
                `;
            }).join("");

            return `
                <section class="report-team">
                    <h2>${this.escapeHTML(team.name)}</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>Salesperson</th>
                                <th class="number">Cars Sold</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${rows}
                            <tr class="total-row">
                                <td>Team Total</td>
                                <td class="number">${team.total}</td>
                            </tr>
                        </tbody>
                    </table>
                </section>
            `;
        }).join("");

        return `
            <div class="print-report">
                <h1>Sales Competition Report</h1>
                <p class="report-date">${this.escapeHTML(label)}</p>

                <div class="report-summary">
                    <span>Total Sales: ${summary.totalSales}</span>
                    <span>Teams: ${summary.teamCount}</span>
                    <span>Salespeople: ${summary.salespersonCount}</span>
                </div>

                ${sections || "<p>No teams for this period.</p>"}
            </div>
        `;
    };

    getReportStyles = () => {
        return `
            * {
                box-sizing: border-box;
            }

            body {
                margin: 0;
                padding: 24px;
                background: white;
                color: #222;
                font-family: Arial, sans-serif;
                font-size: 11px;
            }

            .print-report {
                width: 100%;
                background: white;
            }

            h1 {
                margin: 0 0 6px;
                color: #222;
                font-size: 19px;
            }

            .report-date {
                margin: 0 0 16px;
                color: #666;
            }

            .report-summary {
                display: flex;
                justify-content: space-between;
                gap: 12px;
                margin-bottom: 20px;
                padding: 12px;
                background: #f4f4f4;
                font-weight: bold;
            }

            .report-team {
                margin-bottom: 18px;
                break-inside: avoid;
                page-break-inside: avoid;
            }

            h2 {
                margin: 0 0 8px;
                padding-bottom: 5px;
                border-bottom: 2px solid #EB0A1E;
                font-size: 13px;
            }

            table {
                width: 100%;
                border-collapse: collapse;
            }

            th,
            td {
                padding: 7px 9px;
                border: 1px solid #ddd;
                text-align: left;
            }

            th {
                background: #f4f4f4;
            }

            .number {
                text-align: right;
            }

            .total-row {
                background: #f4f4f4;
                font-weight: bold;
            }

            @media print {
                body {
                    padding: 0;
                }
            }
        `;
    };

    handlePrint = () => {
        const printWindow = window.open(
            "",
            "_blank",
            "width=1000,height=800"
        );

        if (!printWindow) {
            window.alert("Please allow pop-ups to print the report.");
            return;
        }

        const html = `
            <!DOCTYPE html>
            <html lang="en">
                <head>
                    <meta charset="UTF-8" />
                    <title>Sales Competition Report</title>
                    <style>${this.getReportStyles()}</style>
                </head>
                <body>
                    ${this.buildPrintableReport()}
                </body>
            </html>
        `;

        printWindow.document.open();
        printWindow.document.write(html);
        printWindow.document.close();

        printWindow.focus();
        printWindow.print();
    };

    handleDownloadPDF = async () => {
        if (this.state.downloading) {
            return;
        }

        this.setState({ downloading: true });

        try {
            const module = await import("html2pdf.js");
            const html2pdf = module.default || module;

            const container = document.createElement("div");
            const style = document.createElement("style");

            style.textContent = this.getReportStyles();

            container.style.width = "740px";
            container.style.padding = "18px";
            container.style.background = "#ffffff";
            container.innerHTML = this.buildPrintableReport();
            container.prepend(style);

            await html2pdf()
                .set({
                    margin: 8,
                    filename: `sales-report-${this.state.selectedDate}-${this.state.viewMode}.pdf`,
                    image: {
                        type: "jpeg",
                        quality: 0.9
                    },
                    html2canvas: {
                        scale: 1.5,
                        backgroundColor: "#ffffff"
                    },
                    jsPDF: {
                        unit: "mm",
                        format: "a4",
                        orientation: "portrait"
                    },
                    pagebreak: {
                        mode: ["css", "legacy"]
                    }
                })
                .from(container)
                .save();
        } catch (error) {
            console.error("PDF generation failed:", error);
            window.alert("Unable to generate PDF.");
        } finally {
            this.setState({ downloading: false });
        }
    };

    renderSummary = (results) => {
        const summary = this.getSummary(results);

        const items = [
            {
                label: "Total Vehicles Sold",
                value: summary.totalSales,
                icon: <DirectionsCarRoundedIcon />
            },
            {
                label: "Competing Teams",
                value: summary.teamCount,
                icon: <GroupsRoundedIcon />
            },
            {
                label: "Top Team Sales",
                value: summary.highestTotal,
                icon: <EmojiEventsRoundedIcon />
            }
        ];

        return (
            <section
                className="history-summary"
                aria-label="Competition summary"
            >
                {items.map((item) => (
                    <article
                        className="history-stat-card"
                        key={item.label}
                    >
                        <div className="history-stat-icon">
                            {item.icon}
                        </div>

                        <div className="history-stat-content">
                            <span>{item.label}</span>
                            <strong>{item.value}</strong>
                        </div>
                    </article>
                ))}
            </section>
        );
    };

    renderTeamCard = (team, index, highestTotal) => {
        const isWinner = (
            team.total > 0 &&
            team.total === highestTotal
        );

        return (
            <article
                key={team.id || team.name}
                className={`history-team-card ${isWinner ? "history-team-card--winner" : ""}`}
                style={{
                    "--history-team-color": team.color
                }}
            >
                <div className="history-team-header">
                    <div className="history-team-heading">
                        <span className="history-team-color" />

                        <div>
                            <h3>{team.name}</h3>
                            <span>
                                {team.members.length} Salespeople
                            </span>
                        </div>
                    </div>

                    {isWinner ? (
                        <Chip
                            icon={<EmojiEventsRoundedIcon />}
                            label="Winner"
                            className="history-winner-chip"
                        />
                    ) : (
                        <span className="history-team-rank">
                            #{index + 1}
                        </span>
                    )}
                </div>

                <div className="history-team-total">
                    <span>Total Vehicles Sold</span>
                    <strong>{team.total}</strong>
                </div>

                <div className="history-team-members">
                    <div className="history-member-headings">
                        <span>Salesperson</span>
                        <span>Sales</span>
                    </div>

                    {team.members.length === 0 ? (
                        <p className="history-empty-members">
                            No salespeople assigned.
                        </p>
                    ) : (
                        team.members.map((member) => {
                            const isTop = (
                                member.sales > 0 &&
                                member.sales === team.highestMemberSales
                            );

                            return (
                                <div
                                    key={member.name}
                                    className={`history-member-row ${isTop ? "history-member-row--top" : ""}`}
                                >
                                    <div className="history-member-name">
                                        <span className="history-member-avatar">
                                            {member.name.charAt(0).toUpperCase()}
                                        </span>

                                        <div>
                                            <strong>{member.name}</strong>

                                            {isTop && (
                                                <span className="history-top-label">
                                                    <EmojiEventsRoundedIcon />
                                                    Top salesperson
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <strong className="history-member-sales">
                                        {member.sales}
                                    </strong>
                                </div>
                            );
                        })
                    )}
                </div>
            </article>
        );
    };

    renderMonthlyHistory = () => {
        const history = this.getMonthlyHistory();

        return (
            <section className="history-section">
                <div className="history-section-header">
                    <div>
                        <h2>Monthly Competition History</h2>
                        <p>
                            Review past competitions and monthly team totals.
                        </p>
                    </div>

                    <Chip
                        label={`${history.length} Months`}
                        className="history-count-chip"
                    />
                </div>

                {history.length === 0 ? (
                    <div className="history-empty-state">
                        No competition history is available.
                    </div>
                ) : (
                    <div className="history-monthly-table-wrapper">
                        <TableContainer
                            component={Paper}
                            elevation={0}
                            className="history-monthly-table"
                        >
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Month</TableCell>
                                        <TableCell>Winning Team</TableCell>
                                        <TableCell align="right">
                                            Winner Sales
                                        </TableCell>
                                        <TableCell align="right">
                                            Total Sales
                                        </TableCell>
                                    </TableRow>
                                </TableHead>

                                <TableBody>
                                    {history.map((month) => {
                                        const winner = month.results[0];

                                        const hasWinner = (
                                            winner &&
                                            winner.total > 0
                                        );

                                        return (
                                            <TableRow key={month.month}>
                                                <TableCell>
                                                    <strong>
                                                        {month.label}
                                                    </strong>
                                                </TableCell>

                                                <TableCell>
                                                    {hasWinner ? (
                                                        <Tooltip
                                                            arrow
                                                            title={month.results
                                                                .filter((team) => {
                                                                    return team.total === winner.total;
                                                                })
                                                                .map((team) => team.name)
                                                                .join(", ")}
                                                        >
                                                            <span className="history-month-winner">
                                                                <EmojiEventsRoundedIcon />
                                                                {month.results
                                                                    .filter((team) => {
                                                                        return team.total === winner.total;
                                                                    })
                                                                    .map((team) => team.name)
                                                                    .join(", ")}
                                                            </span>
                                                        </Tooltip>
                                                    ) : (
                                                        "No winner"
                                                    )}
                                                </TableCell>

                                                <TableCell align="right">
                                                    {winner ? winner.total : 0}
                                                </TableCell>

                                                <TableCell align="right">
                                                    <strong>
                                                        {month.total}
                                                    </strong>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </div>
                )}
            </section>
        );
    };

    render() {
        const {
            selectedDate,
            viewMode,
            downloading
        } = this.state;

        const results = this.getCurrentResults();
        const summary = this.getSummary(results);
        const topSalespeople = this.getTopSalespeople(results);

        return (
            <main className="history-page">
                <header className="history-page-header">
                    <div>
                        <span className="history-eyebrow">
                            PERFORMANCE & REPORTING
                        </span>

                        <h1>Competition History</h1>

                        <p>
                            Explore sales performance, compare teams,
                            and generate competition reports.
                        </p>
                    </div>

                    <Chip
                        label={this.formatDisplayDate(selectedDate)}
                        className="history-date-chip"
                    />
                </header>

                <section className="history-filter-panel">
                    <div className="history-filter-heading">
                        <div className="history-filter-icon">
                            <CalendarMonthRoundedIcon />
                        </div>

                        <div>
                            <h2>Report Period</h2>
                            <p>{this.getPeriodLabel()}</p>
                        </div>
                    </div>

                    <div className="history-filter-controls">
                        <TextField
                            type="date"
                            size="small"
                            value={selectedDate}
                            onChange={this.handleDateChange}
                            inputProps={{
                                max: this.getTodayDate(),
                                "aria-label": "Select report date"
                            }}
                            className="history-date-input"
                        />

                        <ToggleButtonGroup
                            value={viewMode}
                            exclusive
                            size="small"
                            onChange={this.handleViewModeChange}
                            aria-label="Report period"
                            className="history-view-toggle"
                        >
                            <ToggleButton value="day">
                                Day
                            </ToggleButton>

                            <ToggleButton value="week">
                                Week
                            </ToggleButton>

                            <ToggleButton value="month">
                                Month
                            </ToggleButton>
                        </ToggleButtonGroup>
                    </div>
                </section>

                {this.renderSummary(results)}

                <section className="history-section">
                    <div className="history-section-header">
                        <div>
                            <h2>Team Performance</h2>
                            <p>
                                Rankings and individual sales for
                                the selected period.
                            </p>
                        </div>

                        <div className="history-report-actions">
                            <Button
                                variant="outlined"
                                startIcon={<PrintRoundedIcon />}
                                onClick={this.handlePrint}
                                disabled={results.length === 0}
                                className="history-print-button"
                            >
                                Print
                            </Button>

                            <Button
                                variant="contained"
                                startIcon={<PictureAsPdfRoundedIcon />}
                                onClick={this.handleDownloadPDF}
                                disabled={downloading || results.length === 0}
                                className="history-pdf-button"
                            >
                                {downloading ? "Generating..." : "Download PDF"}
                            </Button>
                        </div>
                    </div>

                    {results.length === 0 ? (
                        <div className="history-empty-state">
                            No teams found for the selected month.
                        </div>
                    ) : (
                        <div className="history-teams-grid">
                            {results.map((team, index) => {
                                return this.renderTeamCard(
                                    team,
                                    index,
                                    summary.highestTotal
                                );
                            })}
                        </div>
                    )}
                </section>

                {topSalespeople.length > 0 && (
                    <section className="history-highlight">
                        <div className="history-highlight-icon">
                            <EmojiEventsRoundedIcon />
                        </div>

                        <div>
                            <span>TOP SALESPERSON</span>

                            <h2>
                                {topSalespeople
                                    .map((person) => person.name)
                                    .join(", ")}
                            </h2>

                            <p>
                                {topSalespeople[0].sales} vehicles sold
                                during the selected period.
                            </p>
                        </div>
                    </section>
                )}

                {this.renderMonthlyHistory()}
            </main>
        );
    }
}

export default History;
