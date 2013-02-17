package com.battlebots;

import com.google.gson.Gson;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;

/**
 * Battle Bots
 * User: James Whitwell
 * Date: 2/11/13
 * Time: 8:50 PM
 */
public class DebugLogging extends BBServlet {

	public DebugLogging() {
		super();
	}

	protected String getResponse(HttpServletRequest request) {

		boolean handledData = false;
		String debugType = Common.getRequestString(request, "debug_type", "");


		if (debugType.equals("terrain")) {
			System.out.println("Debug data: terrain");

			String data = Common.getRequestString(request, "data", "");
			int height = Common.getRequestInt(request, "height", 0);
			int width = Common.getRequestInt(request, "width", 0);

			Gson gson = new Gson();

			Vector3[] terrainData = gson.fromJson(data, Vector3[].class);

			Vector3 vertex;
			for (int h = 0; h < height; h++) {
				for (int w = 0; w < width; w++) {
					vertex = terrainData[(h * height) + w];

					//System.out.println("X: " + vertex.getX() + " Y: " + vertex.getY() + " Z: " + vertex.getZ());


					if (vertex.getY() != 0.0) {

						System.out.print("0");
					} else {
						System.out.print("X");
					}

				}

				System.out.println();
			}

			handledData = true;

		}

		if (handledData) {
			return "ok";
		} else {
			return "nothing to do";
		}
	}
}
