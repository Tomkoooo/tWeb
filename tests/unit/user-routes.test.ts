import { beforeEach, describe, expect, it, vi } from "vitest";
import { createJsonRequest } from "../helpers/next-request";

const authMock = vi.fn();
const dbConnectMock = vi.fn();
const userFindByIdMock = vi.fn();
const userFindOneMock = vi.fn();
const userFindOneAndUpdateMock = vi.fn();
const userDeleteMock = vi.fn();
const orderFindMock = vi.fn();
const orderFindOneMock = vi.fn();
const orderExistsMock = vi.fn();
const productExistsMock = vi.fn();
const reviewUpsertMock = vi.fn();
const feedbackUpsertMock = vi.fn();

vi.mock("@/auth", () => ({ auth: authMock }));
vi.mock("@/lib/db", () => ({ default: dbConnectMock }));
vi.mock("@/models/User", () => ({
  default: {
    findById: userFindByIdMock,
    findOne: userFindOneMock,
    findOneAndUpdate: userFindOneAndUpdateMock,
    findByIdAndDelete: userDeleteMock,
  },
}));
vi.mock("@/models/Order", () => ({
  default: {
    find: orderFindMock,
    findOne: orderFindOneMock,
    exists: orderExistsMock,
  },
}));
vi.mock("@/models/Product", () => ({ default: { exists: productExistsMock } }));
vi.mock("@/models/Review", () => ({ default: { findOneAndUpdate: reviewUpsertMock } }));
vi.mock("@/models/ShopFeedback", () => ({ default: { findOneAndUpdate: feedbackUpsertMock } }));

describe("user api routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authMock.mockResolvedValue({ user: { id: "u1", email: "u@test.hu" } });
    userFindByIdMock.mockReturnValue({ lean: vi.fn().mockResolvedValue({ _id: "u1", newsletterSubscribed: false }) });
    userFindOneMock.mockReturnValue({ lean: vi.fn().mockResolvedValue({ _id: "u1", newsletterSubscribed: false }) });
    userFindOneAndUpdateMock.mockResolvedValue({ _id: "u1" });
    orderFindMock.mockResolvedValue([]);
    orderFindOneMock.mockReturnValue({
      populate: vi.fn().mockReturnThis(),
      sort: vi.fn().mockReturnThis(),
      lean: vi.fn().mockResolvedValue({ _id: "o1" }),
    });
    orderExistsMock.mockResolvedValue(true);
    productExistsMock.mockResolvedValue(true);
    reviewUpsertMock.mockResolvedValue({});
    feedbackUpsertMock.mockResolvedValue({});
  });

  it("gets current user profile", async () => {
    const { GET } = await import("@/app/api/user/profile/route");
    const res = await GET(createJsonRequest("http://localhost/api/user/profile", "GET"));
    expect(res.status).toBe(200);
  });

  it("updates user profile", async () => {
    const { PUT } = await import("@/app/api/user/profile/route");
    const res = await PUT(
      createJsonRequest("http://localhost/api/user/profile", "PUT", {
        billingInfo: { name: "A" },
        shippingAddress: { name: "B" },
        newsletterSubscribed: true,
      })
    );
    expect(res.status).toBe(200);
    expect(userFindOneAndUpdateMock).toHaveBeenCalled();
  });

  it("deletes user profile when no ongoing order", async () => {
    const { DELETE } = await import("@/app/api/user/profile/route");
    const res = await DELETE(createJsonRequest("http://localhost/api/user/profile", "DELETE"));
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(userDeleteMock).toHaveBeenCalled();
  });

  it("returns user orders list", async () => {
    orderFindMock.mockReturnValue({
      populate: vi.fn().mockReturnThis(),
      sort: vi.fn().mockReturnThis(),
      lean: vi.fn().mockResolvedValue([{ _id: "o1" }]),
    });
    const { GET } = await import("@/app/api/user/orders/route");
    const res = await GET(createJsonRequest("http://localhost/api/user/orders", "GET"));
    expect(res.status).toBe(200);
  });

  it("returns one order detail", async () => {
    const { GET } = await import("@/app/api/user/orders/[id]/route");
    const res = await GET(
      createJsonRequest("http://localhost/api/user/orders/o1", "GET"),
      { params: Promise.resolve({ id: "o1" }) }
    );
    expect(res.status).toBe(200);
  });

  it("returns 404 for missing order detail", async () => {
    orderFindOneMock.mockReturnValue({
      populate: vi.fn().mockReturnThis(),
      lean: vi.fn().mockResolvedValue(null),
    });
    const { GET } = await import("@/app/api/user/orders/[id]/route");
    const res = await GET(
      createJsonRequest("http://localhost/api/user/orders/o1", "GET"),
      { params: Promise.resolve({ id: "o1" }) }
    );
    expect(res.status).toBe(404);
  });

  it("submits product review and shop feedback", async () => {
    const { POST: postReview } = await import("@/app/api/user/reviews/route");
    const { POST: postFeedback } = await import("@/app/api/user/feedback/route");

    const reviewRes = await postReview(
      createJsonRequest("http://localhost/api/user/reviews", "POST", {
        productId: "p1",
        rating: 5,
        comment: "ok",
      })
    );
    const feedbackRes = await postFeedback(
      createJsonRequest("http://localhost/api/user/feedback", "POST", {
        rating: 5,
        comment: "great",
      })
    );

    expect(reviewRes.status).toBe(200);
    expect(feedbackRes.status).toBe(200);
    expect(reviewUpsertMock).toHaveBeenCalled();
    expect(feedbackUpsertMock).toHaveBeenCalled();
  });

  it("returns unauthorized for user routes", async () => {
    authMock.mockResolvedValue(null);
    const { GET: getProfile } = await import("@/app/api/user/profile/route");
    const { GET: getOrders } = await import("@/app/api/user/orders/route");
    const profileRes = await getProfile(createJsonRequest("http://localhost/api/user/profile", "GET"));
    const ordersRes = await getOrders(createJsonRequest("http://localhost/api/user/orders", "GET"));
    expect(profileRes.status).toBe(401);
    expect(ordersRes.status).toBe(401);
  });

  it("covers not found and validation branches", async () => {
    userFindByIdMock.mockReturnValueOnce({ lean: vi.fn().mockResolvedValue(null) });
    const { GET: getProfile } = await import("@/app/api/user/profile/route");
    const profileRes = await getProfile(createJsonRequest("http://localhost/api/user/profile", "GET"));
    expect(profileRes.status).toBe(404);

    orderExistsMock.mockResolvedValueOnce(false);
    const { POST: postReview } = await import("@/app/api/user/reviews/route");
    const reviewRes = await postReview(
      createJsonRequest("http://localhost/api/user/reviews", "POST", {
        productId: "p1",
        rating: 5,
      })
    );
    expect(reviewRes.status).toBe(403);

    const { POST: postFeedback } = await import("@/app/api/user/feedback/route");
    const feedbackRes = await postFeedback(
      createJsonRequest("http://localhost/api/user/feedback", "POST", {
        rating: 0,
      })
    );
    expect(feedbackRes.status).toBe(400);
  });

  it("blocks account deletion when ongoing orders exist", async () => {
    orderFindMock.mockResolvedValue([{ _id: "ongoing" }]);
    const { DELETE } = await import("@/app/api/user/profile/route");
    const res = await DELETE(createJsonRequest("http://localhost/api/user/profile", "DELETE"));
    expect(res.status).toBe(400);
  });

  it("returns server error on thrown exception branches", async () => {
    dbConnectMock.mockRejectedValueOnce(new Error("db error"));
    const { GET: getProfile } = await import("@/app/api/user/profile/route");
    const res = await getProfile(createJsonRequest("http://localhost/api/user/profile", "GET"));
    expect(res.status).toBe(500);
  });
});
