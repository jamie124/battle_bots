package com.battlebots;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;
import java.io.PrintWriter;

/**
 * Battle Bots
 * User: James Whitwell
 * Date: 2/11/13
 * Time: 8:57 PM
 */
public abstract class BBServlet extends HttpServlet {

	protected String contentType = "application/json";

	public BBServlet() {
		super();
	}

	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		response.setContentType(contentType);

		HttpSession session = request.getSession(false);

		String responseString = getResponse(request);

		PrintWriter out = response.getWriter();
		out.println(responseString);
		out.flush();
		out.close();
	}

	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		doPost(request, response);
	}

	protected abstract String getResponse(HttpServletRequest request);
}
