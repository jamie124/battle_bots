package com.battlebots;

import java.io.IOException;

/**
 * Created with IntelliJ IDEA.
 * User: James Whitwell
 * Date: 2/8/13
 * Time: 9:12 PM
 * To change this template use File | Settings | File Templates.
 */
public class RequestContent extends javax.servlet.http.HttpServlet {
	protected void doPost(javax.servlet.http.HttpServletRequest request, javax.servlet.http.HttpServletResponse response) throws javax.servlet.ServletException, IOException {

	}

	protected void doGet(javax.servlet.http.HttpServletRequest request, javax.servlet.http.HttpServletResponse response) throws javax.servlet.ServletException, IOException {
		System.out.println("Requesting content.");
	}
}
