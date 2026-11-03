
import React, { Component, createRef } from "react";

import {
    Button,
    Chip,
    Paper
} from "@mui/material";

import {
    BarChart,
    Bar,
    Cell,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line,
    Legend
} from "recharts";

import DirectionsCarRoundedIcon from "@mui/icons-material/DirectionsCarRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import EmojiEventsRoundedIcon from "@mui/icons-material/EmojiEventsRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import PrintRoundedIcon from "@mui/icons-material/PrintRounded";
import PictureAsPdfRoundedIcon from "@mui/icons-material/PictureAsPdfRounded";

import html2canvas from "html2canvas";
import jsPDF from "jspdf";

import "./CompetitionAndCharts.css";

class CompetitionAndCharts extends Component {
    constructor(props) {
        super(props);

        this.state = {
            downloading: false
        };

        this.reportRef = createRef();
    }

    getCurrentMonthKey = () => {
        const now = new Date();

        return [
            now.getFullYear(),
            String(now.getMonth() + 1).padStart(2, "0")
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

    getMonthLabel = () => {
        const now = new Date();

        return now.toLocaleDateString("en-US", {
            month: "long",
            year: "numeric"
        });
    };

    getCurrentTeams = () => {
        const { teams = [] } = this.props;
        const month = this.getCurrentMonthKey();

        return teams
            .filter((team) => {
                return this.normalizeDate(team.date).slice(0, 7) === month;
            })
            .sort((a, b) => a.name.localeCompare(b.name));
    };

    getCurrentSalesData = () => {
        const { salesData = [] } = this.props;
        const month = this.getCurrentMonthKey();

        return salesData
            .filter((entry) => {
                return this.normalizeDate(entry.date).slice(0, 7) === month;
            })
            .sort((a, b) => {
                return this.normalizeDate(a.date).localeCompare(
                    this.normalizeDate(b.date)
                );
            });
    };

    getSalespersonTotals = (teams, salesData) => {
        const totals = {};

        teams.forEach((team) => {
            (team.members || []).forEach((member) => {
                totals[member] = 0;
            });
        });

        salesData.forEach((entry) => {
            Object.keys(totals).forEach((member) => {
                const value = Number(entry[member] || 0);

                if (Number.isFinite(value)) {
                    totals[member] += value;
                }
            });
        });

        return totals;
    };

    getTeamResults = (teams, salespersonTotals) => {
        return teams.map((team) => {
            const members = (team.members || [])
                .map((name) => ({
                    name,
                    sales: salespersonTotals[name] || 0
                }))
                .sort((a, b) => {
                    return b.sales - a.sales ||
                        a.name.localeCompare(b.name);
                });

            const total = members.reduce((sum, member) => {
                return sum + member.sales;
            }, 0);

            return {
                id: team.id,
                name: team.name,
                color: team.color || "#64748b",
                members,
                total
            };
        }).sort((a, b) => {
            return b.total - a.total ||
                a.name.localeCompare(b.name);
        });
    };

    getDailySales = (team, salesData) => {
        return salesData.map((entry) => {
            const normalized = this.normalizeDate(entry.date);

            const row = {
                date: normalized.slice(8, 10)
            };

            team.members.forEach((member) => {
                row[member.name] = Number(entry[member.name] || 0);
            });

            return row;
        });
    };

    getSummary = (results) => {
        const uniquePeople = new Set();

        results.forEach((team) => {
            team.members.forEach((member) => {
                uniquePeople.add(member.name);
            });
        });

        return {
            totalSales: results.reduce((sum, team) => {
                return sum + team.total;
            }, 0),
            teamCount: results.length,
            salespersonCount: uniquePeople.size,
            topSales: Math.max(
                0,
                ...results.map((team) => team.total)
            )
        };
    };

    getLineColors = () => {
        return [
            "#4779a8",
            "#508c78",
            "#9476ad",
            "#b28c4e",
            "#4c8f9b",
            "#6c7793",
            "#8a8f58",
            "#8b6f79"
        ];
    };

    renderBarTooltip = ({ active, payload, label }) => {
        if (!active || !payload || !payload.length) {
            return null;
        }

        const results = this.getTeamResults(
            this.getCurrentTeams(),
            this.getSalespersonTotals(
                this.getCurrentTeams(),
                this.getCurrentSalesData()
            )
        );

        const team = results.find((item) => item.name === label);

        return (
            <div className="competition-chart-tooltip">
                <strong>{label}</strong>

                <p>
                    Total Sales: {payload[0].value}
                </p>

                {team && (
                    <span>
                        {team.members.length} salespeople
                    </span>
                )}
            </div>
        );
    };

    handlePrint = async () => {
        const element = this.reportRef.current;

        if (!element) {
            return;
        }

        try {
            const canvas = await html2canvas(element, {
                scale: 1.5,
                backgroundColor: "#ffffff",
                useCORS: true
            });

            const image = canvas.toDataURL("image/png");

            const printWindow = window.open(
                "",
                "_blank",
                "width=1100,height=850"
            );

            if (!printWindow) {
                window.alert("Please allow pop-ups to print the charts.");
                return;
            }

            printWindow.document.write(`
                <!DOCTYPE html>
                <html lang="en">
                    <head>
                        <meta charset="UTF-8" />
                        <title>Sales Competition Charts</title>
                        <style>
                            body {
                                margin: 0;
                                padding: 15px;
                                background: white;
                            }

                            img {
                                display: block;
                                width: 100%;
                                height: auto;
                            }
                        </style>
                    </head>
                    <body>
                        <img src="${image}" alt="Sales competition charts" />
                    </body>
                </html>
            `);

            printWindow.document.close();

            const printImage = printWindow.document.querySelector("img");

            printImage.onload = () => {
                printWindow.focus();
                printWindow.print();
            };

            if (printImage.complete) {
                printWindow.focus();
                printWindow.print();
            }
        } catch (error) {
            console.error("Unable to print charts:", error);
            window.alert("Unable to prepare charts for printing.");
        }
    };

    handleDownload = async () => {
        const element = this.reportRef.current;

        if (!element || this.state.downloading) {
            return;
        }

        this.setState({ downloading: true });

        try {
            const canvas = await html2canvas(element, {
                scale: 1.5,
                backgroundColor: "#ffffff",
                useCORS: true,
                scrollY: -window.scrollY
            });

            const pdf = new jsPDF({
                orientation: "portrait",
                unit: "mm",
                format: "a4"
            });

            const margin = 10;
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();

            const contentWidth = pageWidth - margin * 2;
            const contentHeight = pageHeight - margin * 2;

            const pageHeightPixels = Math.floor(
                canvas.width * contentHeight / contentWidth
            );

            let offset = 0;
            let page = 0;

            while (offset < canvas.height) {
                const sliceHeight = Math.min(
                    pageHeightPixels,
                    canvas.height - offset
                );

                const pageCanvas = document.createElement("canvas");

                pageCanvas.width = canvas.width;
                pageCanvas.height = sliceHeight;

                const context = pageCanvas.getContext("2d");

                context.fillStyle = "#ffffff";
                context.fillRect(
                    0,
                    0,
                    pageCanvas.width,
                    pageCanvas.height
                );

                context.drawImage(
                    canvas,
                    0,
                    offset,
                    canvas.width,
                    sliceHeight,
                    0,
                    0,
                    canvas.width,
                    sliceHeight
                );

                if (page > 0) {
                    pdf.addPage();
                }

                const imageData = pageCanvas.toDataURL(
                    "image/jpeg",
                    0.88
                );

                const imageHeight = (
                    sliceHeight * contentWidth / canvas.width
                );

                pdf.addImage(
                    imageData,
                    "JPEG",
                    margin,
                    margin,
                    contentWidth,
                    imageHeight
                );

                offset += sliceHeight;
                page += 1;
            }

            pdf.save(
                `sales-competition-${this.getCurrentMonthKey()}.pdf`
            );
        } catch (error) {
            console.error("Unable to generate PDF:", error);
            window.alert("Unable to download the charts.");
        } finally {
            this.setState({ downloading: false });
        }
    };

    renderSummary = (results) => {
        const summary = this.getSummary(results);

        const cards = [
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
                label: "Leading Team Sales",
                value: summary.topSales,
                icon: <EmojiEventsRoundedIcon />
            }
        ];

        return (
            <section
                className="competition-summary"
                aria-label="Monthly sales summary"
            >
                {cards.map((card) => (
                    <article
                        className="competition-stat-card"
                        key={card.label}
                    >
                        <div className="competition-stat-icon">
                            {card.icon}
                        </div>

                        <div className="competition-stat-content">
                            <span>{card.label}</span>
                            <strong>{card.value}</strong>
                        </div>
                    </article>
                ))}
            </section>
        );
    };

    renderTeamCard = (team, index, topSales) => {
        const isWinner = (
            team.total > 0 &&
            team.total === topSales
        );

        return (
            <article
                key={team.id || team.name}
                className={`competition-team-card ${isWinner ? "competition-team-card--leader" : ""}`}
                style={{
                    "--competition-team-color": team.color
                }}
            >
                <div className="competition-team-card-header">
                    <div className="competition-team-title">
                        <span className="competition-team-dot" />

                        <div>
                            <h3>{team.name}</h3>
                            <span>
                                {team.members.length} salespeople
                            </span>
                        </div>
                    </div>

                    {isWinner ? (
                        <Chip
                            icon={<EmojiEventsRoundedIcon />}
                            label="Leading"
                            className="competition-leader-chip"
                        />
                    ) : (
                        <span className="competition-team-rank">
                            #{index + 1}
                        </span>
                    )}
                </div>

                <div className="competition-team-total">
                    <span>Vehicles Sold</span>
                    <strong>{team.total}</strong>
                </div>

                <div className="competition-team-members">
                    {team.members.map((member) => (
                        <div
                            className="competition-team-member"
                            key={member.name}
                        >
                            <span>{member.name}</span>
                            <strong>{member.sales}</strong>
                        </div>
                    ))}
                </div>
            </article>
        );
    };

    renderBarChart = (results) => {
        const data = results.map((team) => ({
            team: team.name,
            totalSales: team.total,
            color: team.color
        }));

        return (
            <section className="competition-section">
                <div className="competition-section-heading">
                    <div>
                        <h2>Team Sales Comparison</h2>
                        <p>
                            Compare total vehicle sales across
                            all teams this month.
                        </p>
                    </div>

                    <Chip
                        label="Monthly"
                        className="competition-section-chip"
                    />
                </div>

                <Paper
                    elevation={0}
                    className="competition-chart-card"
                >
                    <div className="competition-chart-container">
                        <ResponsiveContainer width="100%" height={350}>
                            <BarChart
                                data={data}
                                margin={{
                                    top: 15,
                                    right: 20,
                                    left: 0,
                                    bottom: 10
                                }}
                                barCategoryGap="28%"
                            >
                                <CartesianGrid
                                    stroke="#edf0f3"
                                    strokeDasharray="3 3"
                                    vertical={false}
                                />

                                <XAxis
                                    dataKey="team"
                                    tick={{
                                        fill: "#68707b",
                                        fontSize: 12
                                    }}
                                    axisLine={false}
                                    tickLine={false}
                                />

                                <YAxis
                                    allowDecimals={false}
                                    tick={{
                                        fill: "#68707b",
                                        fontSize: 12
                                    }}
                                    axisLine={false}
                                    tickLine={false}
                                />

                                <Tooltip
                                    content={this.renderBarTooltip}
                                    cursor={{
                                        fill: "#f8f9fb"
                                    }}
                                />

                                <Bar
                                    dataKey="totalSales"
                                    name="Vehicles Sold"
                                    radius={[6, 6, 0, 0]}
                                    maxBarSize={90}
                                >
                                    {data.map((entry, index) => (
                                        <Cell
                                            key={`team-bar-${index}`}
                                            fill={entry.color}
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Paper>
            </section>
        );
    };

    renderLineCharts = (results, salesData) => {
        const colors = this.getLineColors();

        return (
            <section className="competition-section">
                <div className="competition-section-heading">
                    <div>
                        <h2>Daily Sales Performance</h2>
                        <p>
                            Individual salesperson performance
                            throughout the month.
                        </p>
                    </div>

                    <TrendingUpRoundedIcon
                        className="competition-section-icon"
                    />
                </div>

                <div className="competition-line-grid">
                    {results.map((team) => {
                        const data = this.getDailySales(
                            team,
                            salesData
                        );

                        return (
                            <Paper
                                elevation={0}
                                className="competition-line-card"
                                key={team.id || team.name}
                            >
                                <div className="competition-line-header">
                                    <span
                                        className="competition-line-color"
                                        style={{
                                            backgroundColor: team.color
                                        }}
                                    />

                                    <div>
                                        <h3>{team.name}</h3>
                                        <p>Daily vehicle sales by salesperson</p>
                                    </div>
                                </div>

                                {team.members.length === 0 ? (
                                    <div className="competition-chart-empty">
                                        No salespeople assigned to this team.
                                    </div>
                                ) : data.length === 0 ? (
                                    <div className="competition-chart-empty">
                                        No daily sales recorded this month.
                                    </div>
                                ) : (
                                    <div className="competition-line-chart">
                                        <ResponsiveContainer
                                            width="100%"
                                            height={270}
                                        >
                                            <LineChart
                                                data={data}
                                                margin={{
                                                    top: 12,
                                                    right: 18,
                                                    left: -15,
                                                    bottom: 5
                                                }}
                                            >
                                                <CartesianGrid
                                                    stroke="#edf0f3"
                                                    strokeDasharray="3 3"
                                                    vertical={false}
                                                />

                                                <XAxis
                                                    dataKey="date"
                                                    tick={{
                                                        fill: "#68707b",
                                                        fontSize: 11
                                                    }}
                                                    axisLine={false}
                                                    tickLine={false}
                                                />

                                                <YAxis
                                                    allowDecimals={false}
                                                    tick={{
                                                        fill: "#68707b",
                                                        fontSize: 11
                                                    }}
                                                    axisLine={false}
                                                    tickLine={false}
                                                />

                                                <Tooltip />

                                                <Legend
                                                    wrapperStyle={{
                                                        fontSize: 11
                                                    }}
                                                />

                                                {team.members.map((member, index) => (
                                                    <Line
                                                        key={member.name}
                                                        type="monotone"
                                                        dataKey={member.name}
                                                        name={member.name}
                                                        stroke={colors[index % colors.length]}
                                                        strokeWidth={2.5}
                                                        dot={{
                                                            r: 3
                                                        }}
                                                        activeDot={{
                                                            r: 5
                                                        }}
                                                        connectNulls={false}
                                                    />
                                                ))}
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                )}
                            </Paper>
                        );
                    })}
                </div>
            </section>
        );
    };

    render() {
        const teams = this.getCurrentTeams();
        const salesData = this.getCurrentSalesData();

        const salespersonTotals = this.getSalespersonTotals(
            teams,
            salesData
        );

        const results = this.getTeamResults(
            teams,
            salespersonTotals
        );

        const summary = this.getSummary(results);
        const monthLabel = this.getMonthLabel();

        return (
            <main className="competition-page">
                <header className="competition-page-header">
                    <div>
                        <span className="competition-eyebrow">
                            MONTHLY PERFORMANCE
                        </span>

                        <h1>Competition & Charts</h1>

                        <p>
                            Track team rankings, analyze individual
                            performance, and monitor monthly sales.
                        </p>
                    </div>

                    <Chip
                        label={monthLabel}
                        className="competition-month-chip"
                    />
                </header>

                {teams.length === 0 ? (
                    <div className="competition-empty-state">
                        <GroupsRoundedIcon />

                        <h2>No Teams for {monthLabel}</h2>

                        <p>
                            Create teams for the current month
                            to start tracking competition results.
                        </p>
                    </div>
                ) : (
                    <>
                        {this.renderSummary(results)}

                        <div className="competition-section-heading">
                            <div>
                                <h2>Team Leaderboard</h2>
                                <p>
                                    Current rankings based on total
                                    vehicles sold.
                                </p>
                            </div>

                            <div className="competition-report-actions">
                                <Button
                                    variant="outlined"
                                    startIcon={<PrintRoundedIcon />}
                                    onClick={this.handlePrint}
                                    className="competition-print-button"
                                >
                                    Print Charts
                                </Button>

                                <Button
                                    variant="contained"
                                    startIcon={<PictureAsPdfRoundedIcon />}
                                    onClick={this.handleDownload}
                                    disabled={this.state.downloading}
                                    className="competition-pdf-button"
                                >
                                    {this.state.downloading
                                        ? "Generating..."
                                        : "Download PDF"}
                                </Button>
                            </div>
                        </div>

                        <div ref={this.reportRef}>
                            <section className="competition-teams-grid">
                                {results.map((team, index) => {
                                    return this.renderTeamCard(
                                        team,
                                        index,
                                        summary.topSales
                                    );
                                })}
                            </section>

                            {this.renderBarChart(results)}

                            {this.renderLineCharts(results, salesData)}
                        </div>
                    </>
                )}
            </main>
        );
    }
}

export default CompetitionAndCharts;
