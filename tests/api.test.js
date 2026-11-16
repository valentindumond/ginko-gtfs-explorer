import request from "supertest";
import { describe, it, expect } from "vitest";
import app from "../app.js";

describe("GET /api/lignes", () => {
    it("devrait retourner la liste des lignes", async () => {
        const response = await request(app).get("/api/lignes");
        expect(response.status).toBe(200);
        expect(response.body).toBeInstanceOf(Array);
        expect(response.body).toHaveLength(12);
        expect(response.body).toEqual(
        // VÃ©rifie que le tableau contient des objets avec cette structure minimale
        expect.arrayContaining([
            expect.objectContaining({
                id: expect.any(String),
                name: expect.any(String),
                short_name: expect.any(String),
                color: expect.any(String),
                text_color: expect.any(String),
                directions: expect.toSatisfy(tab => Array.isArray(tab) && tab.length > 0)
            })
        ])
        );
    });
});

describe("GET /api/horaires/:ligne/:direction", () => {
    it("ne devrait pas trouver une ligne qui n'existe pas", async () => {
        const response = await request(app).get("/api/horaires/0/0");
        expect(response.status).toBe(404);
    });
    it("ne devrait pas trouver une direction qui n'existe pas", async () => {
        const response = await request(app).get("/api/horaires/3/8");
        expect(response.status).toBe(404);
    });
    it("ne devrait pas trouver une date qui n'existe pas", async () => {
        const response = await request(app).get("/api/horaires/3/0?date=1955-10-15");
        expect(response.status).toBe(200);
        expect(response.body).toBeInstanceOf(Object);
        expect(response.body.trips.length).toBe(0);
    });
    it("devrait trouver une rÃ©ponse pour le 10 novembre", async () => {
        const response = await request(app).get("/api/horaires/3/0/?date=20261110");
        expect(response.status).toBe(200);
        expect(response.body).toBeInstanceOf(Object);
        expect(response.body.trips.length).toBeGreaterThan(0);
    });
});
